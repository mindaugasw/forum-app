<?php

namespace App\Service\Validator;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/*
 * Validator, ViolationUtil and TextUtil from:
 * http://www.inanzzz.com/index.php/post/umax/using-native-symfony-serializer-and-validator-for-json-api
 */

class Validator
{
	/**
	 * @var SerializerInterface
	 */
	private $serializer;
	/**
	 * @var ValidatorInterface
	 */
	private $validator;
	/**
	 * @var ViolationUtil
	 */
	private $violator;
	
	public function __construct(
		SerializerInterface $serializer,
		ValidatorInterface $validator,
		ViolationUtil $violator)
	{
		$this->serializer = $serializer;
		$this->validator = $validator;
		$this->violator = $violator;
	}
	
	/**
	 * @param string $json Json string to validate
	 * @param string $model Model to validate against
	 * @param array $allowedFields String array of allowed field names. If empty, all fields are allowed
	 * @return array|object
	 */
	public function ValidateJson(string $json, string $model, array $allowedFields = [])
	{
		if (!$json) {
			throw new BadRequestHttpException('Empty body.');
		}
		
		if (!empty($allowedFields)) {
			$decoded = json_decode($json, true);
			if ($decoded === null)
				throw new BadRequestHttpException('Invalid body.');
			
			foreach ($decoded as $key => $value)
			{
				if (!in_array($key, $allowedFields))
					throw new BadRequestHttpException('Unsupported field: ' . $key);
			}
		}
		
		try {
			$object = $this->serializer->deserialize($json, $model, 'json');
		} catch (\Throwable $e) {
			throw new BadRequestHttpException('Invalid body.');
		}
		
		$errors = $this->validator->validate($object);
		
		if ($errors->count()) {
			throw new BadRequestHttpException(json_encode($this->violator->build($errors)));
		}
		
		return $object;
	}
}