<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Entity\User;
use App\Entity\VoteThread;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Knp\Component\Pager\Pagination\PaginationInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;

abstract class BaseController extends AbstractController
{
	/** @var SerializerInterface */
	protected $serializer;
	/** @var EntityManagerInterface */
	protected $em;
	/** @var JsonValidator */
	protected $jsonValidator;
	/** @var QueryParamsValidator */
	protected $queryValidator;
	
	public function __construct(
		SerializerInterface $serializer,
		EntityManagerInterface $em,
		JsonValidator $validator,
		QueryParamsValidator $queryValidator)
	{
		$this->serializer = $serializer;
		$this->em = $em;
		$this->jsonValidator = $validator;
		$this->queryValidator = $queryValidator;
	}
	
	/**
	 * @param $data
	 * @param int $status
	 * @param array $groups Serialization groups
	 * @param array $ignoredAttributes Entity attribute names which should not be serialized
	 * @return JsonResponse
	 */
	protected function ApiResponse($data, int $status = 200, array $groups = [], array $ignoredAttributes = []): JsonResponse
	{
		$serializedData = $this->serializer->serialize(
			$data,
			'json',
			['groups' => $groups, 'ignored_attributes' => $ignoredAttributes]);
		return new JsonResponse($serializedData, $status, [], true);
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
		$paginatedData = ['items' => $data, 'pagination' => $data->getPaginationData()];
		return $this->ApiResponse($paginatedData, $status, $groups, $ignoredAttributes);
	}
}
