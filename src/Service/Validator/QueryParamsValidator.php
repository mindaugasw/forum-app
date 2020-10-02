<?php


namespace App\Service\Validator;


use App\Entity\Thread;
use Knp\Component\Pager\Pagination\PaginationInterface;
use ReflectionClass;
use RuntimeException;
use Symfony\Component\DependencyInjection\ParameterBag\ContainerBagInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBag;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpClient\Exception\ClientException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class QueryParamsValidator
{
	// Query params keys
	public const ORDER_BY = 'orderby';
	public const ORDER_DIR = 'orderdir';
	public const PAGE_NUM = 'page';
	public const PER_PAGE = 'perpage';
	
	/*
	 * // TODO use violator like in JsonValidator
	 * @var ViolationUtil
	 */
	//private $violator;
	
	/** @var ContainerBagInterface */
	private $params;
	
	public function __construct(ParameterBagInterface $params)
	{
		$this->params = $params;
	}
	
	/**
	 * Joins Ordering and Pagination params validation into one method.
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
	 * @param array $proprsWhitelist Allow only these properties in 'orderby' 
	 * @param array $paramsBlacklist Allow all properties on entity entityName except those in the blacklist
	 */
	public function Ordering(Request $request, string $entityName, array $propsWhitelist = null, array $propsBlacklist = null)
	{
		// ORDER FIELD NAME
		if ($propsWhitelist !== null && $propsBlacklist !== null)
			throw new RuntimeException('Whitelist and blacklist cannot both be set.'); // TODO change all exceptions to some other 400 exception
		
		if (!$request->query->has(self::ORDER_BY))
			return [];
		
		$orderBy = $request->query->get(self::ORDER_BY);
		if ($propsWhitelist !== null)
		{
			if (!in_array($orderBy, $propsWhitelist))
				throw new RuntimeException("Ordering by '{$orderBy}' is not allowed.");
		}
		
		if ($propsBlacklist !== null)
		{
			if (in_array($orderBy, $propsBlacklist))
				throw new RuntimeException("Ordering by '{$orderBy}' is not allowed.");
			
			$classProperties = array_keys((new ReflectionClass($entityName))->getDefaultProperties());
			
			if (!in_array($orderBy, $classProperties))
				throw new RuntimeException("Ordering by '{$orderBy}' is not allowed.");
		}
		
		// ORDER DIRECTION
		$direction = 'ASC';
		if ($request->query->has(self::ORDER_DIR))
		{
			$direction = mb_strtoupper($request->query->get(self::ORDER_DIR));
			if ($direction !== 'ASC' && $direction !== 'DESC')
				throw new RuntimeException('Unknown sorting direction.');
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
			throw new RuntimeException('Illegal page number: '.$page);
		
		$perpage = $request->query->getInt(self::PER_PAGE, $this->params->get('per_page_default'));
		if ($perpage < 1 || $perpage > 200)
			throw new RuntimeException('Illegal per page number: '.$perpage);
		
		return ['page' => $page, 'perpage' => $perpage];
	}
	
}