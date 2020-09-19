<?php

namespace App\Controller;

use App\Entity\Thread;
use App\Form\ThreadType;
use App\Repository\ThreadRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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
    	// TODO pagination, filtering, sorting
    	// TODO add authors
    	return $this->ApiResponse(
    		$data, 200, ['thread_read', 'user_read'], ['threads']
		);
    }
	
	/**
	 * @Route("/{id}", name="thread_get", methods={"GET"})
	 */
	public function getOne(Thread $thread)
	{
		// TODO add author, comments
		// TODO comments pagination
		return $this->ApiResponse($thread, 200, ['thread_read', 'user_read'], ['threads']);
	}
    
    /**
     * @Route("/", name="thread_new", methods={"POST"})
	 * @IsGranted("ROLE_USER")
     */
    public function createNew(Request $request)
    {
    	/** @var Thread $thread */
		$thread = $this->validator->ValidateJson($request->getContent(), Thread::class);
    	$thread->setAuthor($this->getUser());
		
    	// TODO csrf
		$this->em->persist($thread);
    	$this->em->flush();
    	
    	return $this->ApiResponse($thread, 201, ['thread_read']);
    }

    /**
     * @Route("/{id}/edit", name="thread_edit", methods={"GET","POST"})
     */
    public function edit(Request $request, Thread $thread): Response
    {
        $form = $this->createForm(ThreadType::class, $thread);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->getDoctrine()->getManager()->flush();

            return $this->redirectToRoute('thread_index');
        }

        return $this->render('thread/edit.html.twig', [
            'thread' => $thread,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="thread_delete", methods={"DELETE"})
     */
    public function delete(Request $request, Thread $thread): Response
    {
        if ($this->isCsrfTokenValid('delete'.$thread->getId(), $request->request->get('_token'))) {
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->remove($thread);
            $entityManager->flush();
        }

        return $this->redirectToRoute('thread_index');
    }
}
