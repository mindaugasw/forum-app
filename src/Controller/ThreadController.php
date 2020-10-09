<?php

namespace App\Controller;

use App\Entity\Thread;
use App\Entity\User;
use App\Service\EntitiesCRUD\ThreadCRUD;
use App\Service\VotingService;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/threads")
 */
class ThreadController extends BaseController
{
	private ThreadCRUD $threadCRUD;
	
	public function __construct(ThreadCRUD $threadCRUD)
	{
		parent::__construct();
		$this->threadCRUD = $threadCRUD;
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
    	$data = $this->threadCRUD->getList($request);
		
		return $this->ApiPaginatedResponse(
    		$data, 200, ['thread_read', 'user_read'], ['threads']
		);
	}

	/**
	 * Get a single thread, NOT including its comments.
	 * 
	 * @Route("/{id}/", methods={"GET"})
	 */
	public function getOne(Thread $thread)
	{
		return $this->ApiResponse($thread, 200, ['thread_read', 'user_read'], ['threads']);
	}
    
    /**
     * @Route("/", methods={"POST"})
	 * @IsGranted(User::ROLE_USER)
     */
    public function createNew(Request $request)
    {
		$thread = $this->threadCRUD->createNew($request);
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
    	$thread = $this->threadCRUD->edit($thread, $request);
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
	 * @IsGranted(User::ROLE_USER)
	 */
	public function vote(Thread $thread, int $voteValue, VotingService $votingService)
	{
		$votingService->submitThreadVote($thread, $voteValue);
		
		return $this->ApiResponse(null, 204);
	}
	
	// TODO add threads search
}
