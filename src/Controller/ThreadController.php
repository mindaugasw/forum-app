<?php

namespace App\Controller;

use App\Entity\Thread;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/threads")
 */
class ThreadController extends BaseController
{
    /**
     * @Route("/", name="thread_list", methods={"GET"})
     */
    public function getList()
    {
    	$data = $this->threadsRepo->findAll();
		return $this->ApiResponse(
    		$data, 200, ['thread_read', 'user_read'], ['threads']
		);
		// TODO pagination, filtering, sorting
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
}
