<?php


namespace App\EventListener;


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
	private ApiResponseFactory $responses;
	
	public function __construct(ApiResponseFactory $responses)
	{
		$this->responses = $responses;
	}
	
	/**
	 * @param ExceptionEvent $event
	 */
	public function onKernelException(ExceptionEvent $event)
	{
		$exception = $event->getThrowable();
		$request   = $event->getRequest();
		
		if ($exception instanceof HttpExceptionInterface)
			$statusCode = $exception->getStatusCode();
		else
			$statusCode = 500;
		
		if (in_array('application/json', $request->getAcceptableContentTypes())) {
			//$response = $this->createApiResponse($exception);
			//$event->setResponse($response);
			
			$response = $this->responses->ErrorResponse($exception->getCode()/*TODO*/, $exception->getMessage(), $statusCode);
			$event->setResponse($response);
		}
	}
}