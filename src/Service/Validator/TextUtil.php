<?php


namespace App\Service\Validator;

/*
 * Validator, ViolationUtil and TextUtil from:
 * http://www.inanzzz.com/index.php/post/umax/using-native-symfony-serializer-and-validator-for-json-api
 */

class TextUtil
{
	public function makeSnakeCase(string $text): string
	{
		if (!trim($text)) {
			return $text;
		}
		
		return strtolower(preg_replace('~(?<=\\w)([A-Z])~', '_$1', $text));
	}
}