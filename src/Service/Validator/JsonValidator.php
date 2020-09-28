<?php

namespace App\Service\Validator;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/*
 * Validator, ViolationUtil and TextUtil from:
 * http://www.inanzzz.com/index.php/post/umax/using-native-symfony-serializer-and-validator-for-json-api
 */

class JsonValidator
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
	 * On successful validation returns new object of type $model from given Json.
	 * Throws exception on validation error.
	 * 
	 * @param string $json Json string to validate
	 * @param string $model Model to validate against
	 * @param array $groups Deserialization groups
	 * @return array|object
	 */
	public function ValidateNew(string $json, string $model, array $groups = [])
	{
		if (!$json) {
			throw new BadRequestHttpException('Empty body.');
		}
		
		//$this->CheckAllowedFields($json, $allowedFields);
		
		try {
			$object = $this->serializer->deserialize($json, $model, 'json', ['groups' => $groups]);
		} catch (\Throwable $e) {
			throw new BadRequestHttpException('Invalid body.');
		}
		
		$errors = $this->validator->validate($object);
		
		if ($errors->count()) {
			throw new BadRequestHttpException(json_encode($this->violator->build($errors)));
		}
		
		return $object;
	}
	
	/**
	 * On successful validation returns updated $obj from given Json.
	 * Throws exception on validation error.
	 * 
	 * @param string $json Json string to validate
	 * @param object $obj Object to update
	 * @param array $groups Deserialization groups
	 * @return array|object
	 */
	public function ValidateEdit(string $json, object $obj, array $groups = [])
	{
		if (!$json) {
			throw new BadRequestHttpException('Empty body.');
		}
		
		//$this->CheckAllowedFields($json, $allowedFields);
		$model = get_class($obj);
		
		try {
			$object = $this->serializer->deserialize($json, $model, 'json', [AbstractNormalizer::OBJECT_TO_POPULATE => $obj, 'groups' => $groups]);
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