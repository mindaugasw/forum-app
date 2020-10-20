<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Generic NotFound exception. Returns 404 status code.
 */
class ApiNotFoundException extends NotFoundHttpException implements ClientFriendlyExceptionInterface
{
	/**
	 * Generic NotFound exception. Returns 404 status code.
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