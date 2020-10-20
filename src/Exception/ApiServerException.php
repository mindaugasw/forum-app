<?php


namespace App\Exception;


use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Generic server exception. Returns 500 status code.
 */
class ApiServerException extends \HttpRuntimeException implements ClientFriendlyExceptionInterface
{
	/**
	 * Generic server exception. Returns 500 status code.
	 * @param string $message Human-readable error message
	 * @param int $code
	 * @param Throwable|null $previous
	 */
	public function __construct($message = "", $code = 0, Throwable $previous = null)
	{
		parent::__construct($message, $code, $previous);
	}
}