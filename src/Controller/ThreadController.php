<?php

namespace App\Controller;

use App\Entity\Thread;
use App\Entity\VoteThread;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/threads")
 */
class ThreadController extends BaseController
{
    /**
     * @Route("/", name="thread_list", methods={"GET"})
     */
    public function getList(Request $request)
    {
    	//$query = $this->threadsRepo->findAll();
    	//$data = $query->getResult();
    	
		$data = $this->threadsRepo->findByPaginated(['author' => $this->getUser()]);
		//$data = $this->threadsRepo->findBy(['author' => $this->getUser()]);
		
		return $this->ApiPaginatedResponse(
    		$data, 200, ['thread_read', 'user_read'], ['threads']
		);
		// TODO filtering, sorting
	}
	
	/**
	 * @Route("/{id}/", name="thread_get", methods={"GET"})
	 */
	public function getOne(Thread $thread)
	{
		return $this->ApiResponse($thread, 200, ['thread_read', 'user_read'], ['threads']);
		// TODO add comments
		// TODO comments pagination
	}
    
    /**
     * @Route("/", name="thread_new", methods={"POST"})
	 * @IsGranted("ROLE_USER")
     */
    public function createNew(Request $request)
    {
    	/** @var Thread $thread */
		$thread = $this->validator->ValidateNew($request->getContent(), Thread::class, ['thread_write']);
    	$thread->setAuthor($this->getUser());
		
		// TODO fix: Thread->updatedAt automatically set also on new creation. Or set updatedAt to not nullable
		$this->em->persist($thread);
    	$this->em->flush();
    	
    	return $this->ApiResponse($thread, 201, ['thread_read', 'user_read'], ['threads']);
    }

    /**
     * @Route("/{id}/", name="thread_edit", methods={"PATCH"})
     */
    public function edit(Thread $thread, Request $request)
    {
		$this->validator->ValidateEdit($request->getContent(), $thread, ['thread_read']);
		$this->em->flush();
		return $this->ApiResponse($thread, 200, ['thread_read', 'user_read'], ['threads']);
		// TODO voter auth
	}

    /**
     * @Route("/{id}/", name="thread_delete", methods={"DELETE"})
     */
    public function delete(Thread $thread)
    {
		$this->em->remove($thread);
		$this->em->flush();
		return $this->ApiResponse(null, 204);
		// TODO voter auth
	}
	
	/**
	 * @Route("/{id}/vote/{voteValue}/", name="thread_vote", methods={"POST"}, requirements={"voteValue"="up|down|none"})
	 * @IsGranted("ROLE_USER")
	 */
	public function vote(Thread $thread, string $voteValue)
	{
		$user = $this->getUser();
		if ($thread->getAuthor() == $user)
			throw new BadRequestHttpException('Voting on your own threads is not allowed');
		
		// exists true
			// vote none
				// do delete
			// vote same
				// do nothing
			// vote different
				// do update
		
		// exists false
			// vote none
				// do nothing
			// vote up/down
				// do create new vote
		
		$upvote = $voteValue === 'up' ? 1 : ($voteValue === 'down' ? 0 : -1);
		$vote = $this->voteThreadRepo->findOneBy(['user' => $user, 'thread' => $thread]);
		
		if ($vote != null) { // vote already exists
			if ($upvote == -1) {
				// voted 'none', delete vote
				$this->em->remove($vote);
			} else if ($upvote == $vote->isUpvote()) {
				// voted same as is currently, do nothing
			} else {
				// voted differently than currently, swap vote
				$vote->setUpvote(!$vote->isUpvote());
			}
		} else { // vote does not exist
			if ($upvote == -1) {
				// voted 'none', do nothing
			} else {
				// voted 'up|down', create new vote
				$vote = VoteThread::create($thread, $user, $upvote);
				$this->em->persist($vote);
			}
		}
		
		$this->em->flush();
		// TODO recount thread votes
		return $this->ApiResponse('success', 200);
	}
}
