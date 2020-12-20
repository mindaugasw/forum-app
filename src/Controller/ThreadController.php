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
class ThreadController extends BaseApiController
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
	 * Can return:
	 * 		200
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
	 * Can return:
	 * 		200
	 * 		404 if thread not found
	 * 
	 * @Route("/{id}/", methods={"GET"})
	 */
	public function getOne(Thread $thread)
	{
		return $this->ApiResponse($thread, 200, ['thread_read', 'user_read'], ['threads']);
	}
    
    /**
	 * Can return:
	 * 		200
	 * 		400 if title or content invalid, invalid request body
	 *		401 if unauthenticated
	 * 
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
	 * Can return:
	 * 		200
	 * 		400 if title or content invalid, invalid request body
	 * 		401 if invalid JWT or unauthorized (editing not your own content and are not admin)
	 * 		404 if thread not found
	 * 
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
	 * Can return:
	 * 		204
	 * 		401 if invalid JWT or unauthorized (deleting your own content and are not admin)
	 * 		404 if thread not found
	 * 
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
	 * Can return:
	 * 		204
	 *		400 if invalid vote value, voting on your own content
	 *		404 if thread not found 
	 * 
	 * @Route("/{id}/vote/{voteValue}/", methods={"POST"}, requirements={"voteValue"="1|0|-1"})
	 * @IsGranted(User::ROLE_USER)
	 */
	public function vote(Thread $thread, int $voteValue, VotingService $votingService)
	{
		$votingService->submitThreadVote($thread, $voteValue);
		
		return $this->ApiResponse(null, 204);
	}
	
	// TODO FEATURE add threads search
}
