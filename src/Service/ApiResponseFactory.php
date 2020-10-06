<?php


namespace App\Service;


use Knp\Component\Pager\Pagination\PaginationInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;

class ApiResponseFactory
{
	private SerializerInterface $serializer;
	
	public function __construct(SerializerInterface $serializer)
	{
		$this->serializer = $serializer;
	}
	
	/**
	 * Serializes provided data and returns JsonResponse
	 * @param $data
	 * @param int $status
	 * @param array $groups Serialization groups
	 * @param array $ignoredAttributes Entity attribute names which should not be serialized
	 * @return JsonResponse
	 */
	public function ApiResponse($data, int $status = 200, array $groups = [], array $ignoredAttributes = []): JsonResponse
	{
		$serializedData = $this->serializer->serialize(
			$data,
			'json',
			['groups' => $groups, 'ignored_attributes' => $ignoredAttributes]);
		return new JsonResponse($serializedData, $status, [], true);
	}
	
	/**
	 * Serializes paginated data and returns JsonResponse
	 * 
	 * @param PaginationInterface $data
	 * @param int $status
	 * @param array $groups Serialization groups
	 * @param array $ignoredAttributes Entity attribute names which should not be serialized
	 * @return JsonResponse
	 */
	public function ApiPaginatedResponse(PaginationInterface $data, int $status = 200, array $groups = [], array $ignoredAttributes = []): JsonResponse
	{
		$paginatedData = ['items' => $data, 'pagination' => $data->getPaginationData()];
		return $this->ApiResponse($paginatedData, $status, $groups, $ignoredAttributes);
	}

	/*public function ErrorResponse()
	{
		// TODO
	}*/
}