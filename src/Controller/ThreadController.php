<?php

namespace App\Controller;

use App\Entity\Thread;
use App\Entity\VoteThread;
use App\Repository\ThreadRepository;
use App\Repository\VoteCommentRepository;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * @Route("/api/threads")
 */
class ThreadController extends BaseController
{
	/** @var ThreadRepository */
	private $threadsRepo;
	
	public function __construct(SerializerInterface $serializer, EntityManagerInterface $em, JsonValidator $validator, QueryParamsValidator $queryValidator)
	{
		parent::__construct($serializer, $em, $validator, $queryValidator);
		
		$this->threadsRepo = $em->getRepository(Thread::class);
	}
	
	/**
	 * Get a list of threads.
	 * Allows items ordering and pagination, using query params.
	 * Supported query params: orderby, orderdir, page, perpage.
	 * Defaults to 1st page with 20 items, and no ordering.
	 * More info in QueryParamsValidator.
	 * 
     * @Route("/", methods={"GET"})
     */
    public function getList(Request $request)
    {
		$params = $this->queryValidator->Everything($request, Thread::class, null, ['comments', 'author', 'userVote']);
		
		$data = $this->threadsRepo->findByPaginated([], $params['ordering'], $params['pagination']);
		
		return $this->ApiPaginatedResponse(
    		$data, 200, ['thread_read', 'user_read'], ['threads']
		);
	}

	/**
	 * Get a single thread, NOT including its comments.
	 * // TODO remove this method
	 * 
	 * @Route("/{id}/", methods={"GET"})
	 */
	public function getOne(Thread $thread, VoteCommentRepository $voteCommentRepo)
	{
		$voteCommentRepo->addUserVotesToManyComments($thread->getComments()->toArray());
		
		return $this->ApiResponse($thread, 200, ['thread_read', 'user_read'], ['threads']);
	}
    
    /**
     * @Route("/", methods={"POST"})
	 * @IsGranted("ROLE_USER")
     */
    public function createNew(Request $request)
    {
    	/** @var Thread $thread */
		$thread = $this->jsonValidator->ValidateNew($request->getContent(), Thread::class, ['thread_write']);
    	$thread->setAuthor($this->getUser());
		
		$this->em->persist($thread);
    	$this->em->flush();
    	
    	return $this->ApiResponse($thread, 201, ['thread_read', 'user_read'], ['threads']);
    }

    /**
     * @Route("/{id}/", methods={"PATCH"})
	 * @IsGranted("MANAGE", subject="thread")
     */
    public function edit(Thread $thread, Request $request)
    {
		$this->jsonValidator->ValidateEdit($request->getContent(), $thread, ['thread_write']);
		$this->em->flush();
		return $this->ApiResponse($thread, 200, ['thread_read', 'user_read'], ['threads']);
	}

    /**
     * @Route("/{id}/", methods={"DELETE"})
	 * @IsGranted("MANAGE", subject="thread")
     */
    public function delete(Thread $thread)
    {
		$this->em->remove($thread);
		$this->em->flush();
		return $this->ApiResponse(null, 204); // 204 No Content
	}
	
	/**
	 * @Route("/{id}/vote/{voteValue}/", methods={"POST"}, requirements={"voteValue"="1|0|-1"})
	 * @IsGranted("ROLE_USER")
	 */
	public function vote(Thread $thread, int $voteValue)
	{
		$user = $this->getUser();
		if ($thread->getAuthor() === $user)
			throw new BadRequestHttpException('Voting on your own threads is not allowed.');
		
		$voteThreadRepo = $this->em->getRepository(VoteThread::class); 
		
		$vote = $voteThreadRepo->findOneBy(['user' => $user, 'thread' => $thread]);
		$threadVotesCount = $voteThreadRepo->countThreadVotes($thread);
		$voteValueChange = 0; // How much should be added to $threadVotesCount. Needed to prevent 2 DB flushes just for votes counting.
		
		if ($vote === null) // Create new vote
		{
			$vote = VoteThread::create($thread, $user, $voteValue);
			$this->em->persist($vote);
			$voteValueChange = $voteValue;
		}
		else // Vote already exists, update it
		{
			$voteValueChange = $voteValue - $vote->getVote();
			$vote->setVote($voteValue);
		}
		
		$thread->setVotesCount($threadVotesCount + $voteValueChange);
		
		$this->em->flush();
		
		return $this->ApiResponse(null, 204);
	}
	
	// TODO add threads search
}
