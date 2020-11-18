<?php


namespace App\Service\EntitiesCRUD;


use App\Entity\Comment;
use App\Entity\Thread;
use App\Repository\CommentRepository;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Security;

/**
 * Provides methods for more complex Comment CRUD operations.
 * NOTE: does NOT save changes to DB on its own!
 */
class CommentCRUD
{
	private EntityManagerInterface $em;
	private QueryParamsValidator $queryValidator;
	private JsonValidator $jsonValidator;
	private Security $security;
	
	private CommentRepository $commentRepo;
	
	public function __construct(
		EntityManagerInterface $em,
		QueryParamsValidator $queryValidator,
		JsonValidator $jsonValidator,
		Security $security)
	{
		$this->em = $em;
		$this->queryValidator = $queryValidator;
		$this->jsonValidator = $jsonValidator;
		$this->security = $security;
		
		$this->commentRepo = $em->getRepository(Comment::class);
	}
	
	
	/**
	 * Checks $request for these query params:
	 * orderby, orderdir, page, perpage
	 *
	 * @param Request $request
	 * @return Comment[]|\Knp\Component\Pager\Pagination\PaginationInterface
	 */
	public function getList(Thread $thread, Request $request)
	{
		$params = $this->queryValidator->Everything($request, Comment::class, null, ['edited', 'thread', 'author', 'userVote']);
		
		return $this->commentRepo->findByPaginated(['thread' => $thread->getId()], $params['ordering'], $params['pagination']);
	}
	
	public function createNew(Thread $thread, Request $request)
	{
		$newComment = $this->jsonValidator->ValidateNew($request->getContent(), Comment::class, ['comment_write']);
		$newComment->setAuthor($this->security->getUser());
		$newComment->setThread($thread);
		
		$thread->setCommentsCount($this->commentRepo->countCommentsOnThread($thread) + 1);
		
		return $newComment;
	}
	
	public function edit(Comment $comment,  Request $request)
	{
		$comment = $this->jsonValidator->ValidateEdit($request->getContent(), $comment, ['comment_write']);
		$comment->setEdited(true);
		
		return $comment;
	}
	
	/**
	 * Recounts comments on $thread before comment deletion.
	 */
	public function delete(Thread $thread)
	{
		$thread->setCommentsCount($this->commentRepo->countCommentsOnThread($thread) - 1);
	}
}