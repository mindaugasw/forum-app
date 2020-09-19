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
	 * @return array|object
	 */
	public function ValidateJson(string $json, string $model)
	{
		if (!$json) {
			throw new BadRequestHttpException('Empty body.');
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