<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

abstract class BaseController extends AbstractController
{
	/** @var SerializerInterface */
	protected $serializer;
	/** @var EntityManagerInterface */
	protected $em;
	/**
	 * @var ValidatorInterface
	 */
	private $validator;
	
	/** @var \App\Repository\UserRepository */
	protected $usersRepo;
	/** @var \App\Repository\ThreadRepository */
	protected $threadsRepo;
	/** @var \App\Repository\CommentRepository */
	protected $commentsRepo;

	
	public function __construct(
		SerializerInterface $serializer,
		EntityManagerInterface $em,
		ValidatorInterface $validator)
	{
		$this->serializer = $serializer;
		$this->em = $em;
		$this->validator = $validator;
		
		$this->usersRepo = $em->getRepository(User::class);
		$this->threadsRepo = $em->getRepository(Thread::class);
		$this->commentsRepo = $em->getRepository(Comment::class);
	}
	
	/**
	 * {@inheritDoc}
	 * @return User|null
	 */
	// Overrides base getUser method to set User return type (User instead of UserInterface)
	protected function getUser(): User
	{
		return parent::getUser();
	}
	
	protected function ApiResponse($data, int $status = 200, array $groups = [], array $ignoredAttributes = []): JsonResponse
	{
		$serializedData = $this->serializer->serialize(
			$data,
			'json',
			['groups' => $groups, 'ignored_attributes' => $ignoredAttributes]);
		return new JsonResponse($serializedData, $status, [], true);
	}
	
}
