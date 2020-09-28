<?php

namespace App\Service\Validator;

use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationListInterface;

/*
 * Validator, ViolationUtil and TextUtil from:
 * http://www.inanzzz.com/index.php/post/umax/using-native-symfony-serializer-and-validator-for-json-api
 */

class ViolationUtil
{
	private $textUtil;
	
	public function __construct(TextUtil $textUtil)
	{
		$this->textUtil = $textUtil;
	}
	
	public function build(ConstraintViolationListInterface $violations): array
	{
		$errors = [];
		
		/** @var ConstraintViolation $violation */
		foreach ($violations as $violation) {
			$errors[
			$this->textUtil->makeSnakeCase($violation->getPropertyPath())
			] = $violation->getMessage();
		}
		
		return $this->buildMessages($errors);
	}
	
	private function buildMessages(array $errors): array
	{
		$result = [];
		
		foreach ($errors as $path => $message) {
			$temp = &$result;
			
			foreach (explode('.', $path) as $key) {
				preg_match('/(.*)(\[.*?\])/', $key, $matches);
				if ($matches) {
					$index = str_replace(['[', ']'], '', $matches[2]);
					$temp = &$temp[$matches[1]][$index];
				} else {
					$temp = &$temp[$key];
				}
			}
			
			$temp = $message;
		}
		
		return $result;
	}
}