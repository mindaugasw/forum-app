<?php


namespace App\Service\Validator;


use App\Exception\ApiBadRequestException;
use ReflectionClass;
use RuntimeException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Validates query params based on given requirements
 */
class QueryParamsValidator
{
	// Query params keys (as they should appear in the URL)
	public const ORDER_BY = 'orderby';
	public const ORDER_DIR = 'orderdir';
	public const PAGE_NUM = 'page';
	public const PER_PAGE = 'perpage';
	
	// TODO use $violator like in JsonValidator
	//private ViolationUtil $violator;
	
	// Default number of items per page, set in config in knp_paginator.yaml
	private int $perPageConfig;
	
	public function __construct(ParameterBagInterface $params)
	{
		$this->perPageConfig = $params->get('per_page_default');
	}
	
	/**
	 * Returns ordering and pagination data from query params.
	 * (Joins Ordering and Pagination methods into one method)
	 * 
	 * @param Request $request
	 * @param string|null $entityName Entity name, used for ordering fields validation. If null, ordering is skipped
	 * @param array|null $propsWhitelist Whitelisted ordering properties
	 * @param array|null $propsBlacklist Blacklisted ordering properties
	 */
	public function Everything(Request $request, string $entityName = null, array $propsWhitelist = null, array $propsBlacklist = null)
	{
		$pagination = $this->Pagination($request);
		$ordering = [];
		if ($entityName !== null && ($propsWhitelist !== null || $propsBlacklist !== null))
			$ordering = $this->Ordering($request, $entityName, $propsWhitelist, $propsBlacklist);
		
		return ['ordering' => $ordering, 'pagination' => $pagination];
	}
	
	/**
	 * Validates query parameters 'orderby' and 'orderdir' for list ordering.
	 * If validated successfully, returns ready-to-use array in a query, in the
	 * form ['key' => 'ASC|DESC'], or empty array if no sorting params were found.
	 *
	 * Allowed values for 'orderby' are any in the propsWhitelist OR any properties
	 * on the entity entityName and not in the propsBlackList. Case sensitive. Only
	 * whitelist OR blacklist can be set, other must be null.
	 *
	 * Allowed values for 'orderdir' are ASC, DESC, or blank. Case-insensitive.
	 * In case of blank defaults to ASC.
	 *
	 * @param Request $request
	 * @param string $entityName Class name of the Entity against which to check params blacklist
	 * @param array|null $propsWhitelist Allow only these properties in 'orderby'
	 * @param array|null $propsBlacklist Allow all properties on entity entityName except those in the blacklist
	 */
	public function Ordering(Request $request, string $entityName, array $propsWhitelist = null, array $propsBlacklist = null)
	{
		// ORDER FIELD NAME
		if ($propsWhitelist !== null && $propsBlacklist !== null)
			throw new RuntimeException('Whitelist and blacklist cannot both be set.');
		
		if (!$request->query->has(self::ORDER_BY))
			return [];
		
		$orderBy = $request->query->get(self::ORDER_BY);
		if ($propsWhitelist !== null)
		{
			if (!in_array($orderBy, $propsWhitelist))
				throw new ApiBadRequestException("Ordering by '{$orderBy}' is not allowed.");
		}
		
		if ($propsBlacklist !== null)
		{
			if (in_array($orderBy, $propsBlacklist))
				throw new ApiBadRequestException("Ordering by '{$orderBy}' is not allowed.");
			
			$classProperties = array_keys((new ReflectionClass($entityName))->getDefaultProperties());
			
			if (!in_array($orderBy, $classProperties))
				throw new ApiBadRequestException("Ordering by '{$orderBy}' is not allowed.");
		}
		
		// ORDER DIRECTION
		$direction = 'ASC';
		if ($request->query->has(self::ORDER_DIR))
		{
			$direction = mb_strtoupper($request->query->get(self::ORDER_DIR));
			if ($direction !== 'ASC' && $direction !== 'DESC')
				throw new ApiBadRequestException('Unknown sorting direction.');
		}
		
		return [$orderBy => $direction];
	}
	
	/**
	 * Returns pagination data in the form [int page, int perpage] from query
	 * parameters 'page' and 'perpage'.
	 * If either one not set, page defaults to 1, perpage is retrieved from config.
	 * 
	 * @param Request $request
	 */
	public function Pagination(Request $request)
	{
		$page = $request->query->getInt(self::PAGE_NUM, 1);
		
		if ($page < 1)
			throw new ApiBadRequestException('Illegal page number: '.$page);
		
		$perpage = $request->query->getInt(self::PER_PAGE, $this->perPageConfig);
		if ($perpage < 1 || $perpage > 200)
			throw new ApiBadRequestException('Illegal per page number: '.$perpage);
		
		return ['page' => $page, 'perpage' => $perpage];
	}
	
}