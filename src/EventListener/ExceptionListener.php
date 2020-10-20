<?php

namespace App\EventListener;

use App\Exception\ClientFriendlyExceptionInterface;
use App\Service\ApiResponseFactory;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

/**
 * Converts exceptions to JsonResponse. 
 * Works only if the following header is found:
 * Accept: application/json
 */
class ExceptionListener
{
	private string $app_env;
	private ApiResponseFactory $responses;
	
	public function __construct($app_env, ApiResponseFactory $responses)
	{
		$this->app_env = $app_env;
		$this->responses = $responses;
	}
	
	/**
	 * @param ExceptionEvent $event
	 */
	public function onKernelException(ExceptionEvent $event)
	{
		$request = $event->getRequest();
		
		if (in_array('application/json', $request->getAcceptableContentTypes())) {
			$this->handleException($event);
		}
	}
	
	public function handleException(ExceptionEvent $event)
	{
		$exception = $event->getThrowable();
		
		$statusCode = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;
		
		if ($exception instanceof ClientFriendlyExceptionInterface || $this->app_env === 'dev')
		{
			$message = $exception->getMessage();
			$type = get_class($exception);
		}
		else
		{
			$message = '';
			$type = '';
		}
		
		$response = $this->responses->ErrorResponse($type, $statusCode, $message);
		$event->setResponse($response);
	}
}