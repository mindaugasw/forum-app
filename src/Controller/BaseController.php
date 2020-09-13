<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\SerializerInterface;

abstract class BaseController extends AbstractController
{
	/** @var SerializerInterface */
	protected $serializer;
	/** @var EntityManagerInterface */
	protected $em;
	
	protected $usersRepo;
	protected $threadsRepo;
	protected $commentsRepo;
	
	public function __construct(SerializerInterface $serializer, EntityManagerInterface $em)
	{
		$this->serializer = $serializer;
		$this->em = $em;
		
		$this->usersRepo = $em->getRepository(User::class);
		$this->threadsRepo = $em->getRepository(Thread::class);
		$this->commentsRepo = $em->getRepository(Comment::class);
	}
	
}
