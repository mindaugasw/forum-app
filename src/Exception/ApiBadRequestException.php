<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Generic BadRequest exception. Returns 400 status code.
 */
class ApiBadRequestException extends BadRequestHttpException implements ClientFriendlyExceptionInterface
{
	/**
	 * Generic BadRequest exception. Returns 400 status code.
	 * @param string|null $message Human-readable error message
	 * @param \Throwable|null $previous
	 * @param int $code
	 * @param array $headers
	 */
	public function __construct(string $message = null, \Throwable $previous = null, int $code = 0, array $headers = [])
	{
		parent::__construct($message, $previous, $code, $headers);
	}
}