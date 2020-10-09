<?php

namespace App\Controller;

use App\Service\ApiResponseFactory;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Knp\Component\Pager\Pagination\PaginationInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

abstract class BaseController extends AbstractController
{
	protected EntityManagerInterface $em;
	protected ApiResponseFactory $responses;
	protected JsonValidator $jsonValidator;
	protected QueryParamsValidator $queryValidator;
	
	/**
	 * Used to prevent full constructor overriding in all subclasses.
	 * Constructor will be called first, so any initialization for these dependencies
	 * should be implemented in overridden postDependencyInjection() method.
	 *
	 * Additional dependencies in subclasses can be injected in a constructor.
	 * 
	 * @required
	 * 
	 * @param EntityManagerInterface $em
	 * @param ApiResponseFactory $responses
	 * @param JsonValidator $validator
	 * @param QueryParamsValidator $queryValidator
	 */
	public function injectDependencies(
		EntityManagerInterface $em,
		ApiResponseFactory $responses,
		JsonValidator $validator,
		QueryParamsValidator $queryValidator)
	{
		$this->em = $em;
		$this->responses = $responses;
		$this->jsonValidator = $validator;
		$this->queryValidator = $queryValidator;
		$this->postDependencyInjection();
	}
	
	/**
	 * Initialize here services injected in superclass
	 */
	protected function postDependencyInjection() { }
	
	/**
	 * @param $data
	 * @param int $status
	 * @param array $groups Serialization groups
	 * @param array $ignoredAttributes Entity attribute names which should not be serialized
	 * @return JsonResponse
	 */
	protected function ApiResponse($data, int $status = 200, array $groups = [], array $ignoredAttributes = []): JsonResponse
	{
		return $this->responses->ApiResponse($data, $status, $groups, $ignoredAttributes);
	}
	
	/**
	 * @param PaginationInterface $data
	 * @param int $status
	 * @param array $groups Serialization groups
	 * @param array $ignoredAttributes Entity attribute names which should not be serialized
	 * @return JsonResponse
	 */
	protected function ApiPaginatedResponse(PaginationInterface $data, int $status = 200, array $groups = [], array $ignoredAttributes = []): JsonResponse
	{
		//dd($this->serializer->serialize(['wtf' => 'asdasdasdasd'], 'json'));
		return $this->responses->ApiPaginatedResponse($data, $status, $groups, $ignoredAttributes);
	}
}
