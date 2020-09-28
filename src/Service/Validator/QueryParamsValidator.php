<?php


namespace App\Service\Validator;


use App\Entity\Thread;
use ReflectionClass;
use RuntimeException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class QueryParamsValidator
{
	// Query params keys
	public const ORDER_BY = 'orderby';
	public const ORDER_DIR = 'orderdir';
	
	/*
	 * // TODO use violator like in JsonValidator
	 * @var ViolationUtil
	 */
	//private $violator;
	
	
	/**
	 * Validates query parameters 'orderby' and 'orderdir' for list ordering.
	 * If validated successfully, returns ready-to-use array in a query, in the
	 * form ['key' => 'ASC|DESC'], or empty array if no sorting params were found.
	 * 
	 * Allowed values for 'orderby' are any in the propsWhitelist OR any properties
	 * on the entity entityName and not in the propsBlackList. Case sensitive. Only
	 * whitelist or blacklist can be set, other must be null.
	 * 
	 * Allowed values for 'orderdir' are ASC, DESC, or blank. Case-insensitive.
	 * In case of blank defaults to ASC.
	 * 
	 * @param Request $request
	 * @param string $entityName Class name of the Entity against which to check params blacklist
	 * @param array $proprsWhitelist Allow only these properties in 'orderby' 
	 * @param array $paramsBlacklist Allow all properties on entity entityName except those in the blacklist
	 */
	public function OrderParams(Request $request, string $entityName, array $propsWhitelist = null, array $propsBlacklist = null)
	{
		// foreach param check if in whitelist and has direction or ASC
		
		if ($propsWhitelist !== null && $propsBlacklist !== null)
			throw new RuntimeException('Whitelist and blacklist cannot both be set.');
		
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
		
		$direction = 'ASC';
		if ($request->query->has(self::ORDER_DIR))
		{
			$direction = mb_strtoupper($request->query->get(self::ORDER_DIR));
			if ($direction !== 'ASC' && $direction !== 'DESC')
				throw new RuntimeException('Unknown sorting direction.');
		}
		
		return [$orderBy => $direction];
	}
	
	
}