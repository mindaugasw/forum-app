<?php

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ApiNotFoundException extends NotFoundHttpException implements ClientFriendlyExceptionInterface
{
	public function __construct(string $message = null, \Throwable $previous = null, int $code = 0, array $headers = [])
	{
		parent::__construct($message, $previous, $code, $headers);
	}
}