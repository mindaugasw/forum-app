<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Repository\CommentRepository;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use App\Service\VotingService;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * @Route("/api/threads")
 */
class CommentController extends BaseController
{
	/** @var CommentRepository */
	private $commentsRepo;
	
	public function __construct(SerializerInterface $serializer, EntityManagerInterface $em, JsonValidator $validator, QueryParamsValidator $queryValidator)
	{
		parent::__construct($serializer, $em, $validator, $queryValidator);
		
		$this->commentsRepo = $em->getRepository(Comment::class);
	}
	
	/**
	 * Get a list of comments.
	 * Allows items ordering and pagination, using query params.
	 * Supported query params: orderby, orderdir, page, perpage.
	 * Defaults to 1st page with 20 items, and no ordering.
	 * More info in QueryParamsValidator.
	 *
	 * @Route("/{thread}/comments/", methods={"GET"})
	 */
	public function getList(Thread $thread, Request $request)
	{
		$params = $this->queryValidator->Everything($request, Comment::class, null, ['edited', 'thread', 'author', 'userVote']);
		
		$data = $this->commentsRepo->findByPaginated(['thread' => $thread], $params['ordering'], $params['pagination']);
		
		return $this->ApiPaginatedResponse(
			$data, 200, ['comment_read', 'user_read'], ['threads', 'comments']
		);
	}
	
	/**
	 * Get a single comment.
	 *
	 * @Route("/{thread}/comments/{comment}/", methods={"GET"})
	 */
	public function getOne(Thread $thread, Comment $comment)
	{
		return $this->ApiResponse($comment, 200, ['comment_read', 'user_read', 'thread_read'], ['threads', 'comments']);
	}
	
	/**
	 * @Route("/{thread}/comments/", methods={"POST"})
	 * @IsGranted("ROLE_USER")
	 */
	public function createNew(Thread $thread, Request $request)
	{
		/** @var Comment $comment */
		$comment = $this->jsonValidator->ValidateNew($request->getContent(), Comment::class, ['comment_write']);
		$comment->setThread($thread);
		$comment->setAuthor($this->getUser());
		
		$this->em->persist($comment);
		$this->em->flush();
		
		return $this->ApiResponse($comment, 201, ['comment_read', 'user_read', 'thread_read'], ['threads', 'comments']);
	}
	
	/**
	 * @Route("/{thread}/comments/{comment}/", methods={"PATCH"})
	 * @IsGranted("MANAGE", subject="comment")
	 */
	public function edit(Thread $thread, Comment $comment, Request $request)
	{
		$this->jsonValidator->ValidateEdit($request->getContent(), $comment, ['comment_write']);
		$comment->setEdited(true);
		$this->em->flush();
		return $this->ApiResponse($comment, 200, ['comment_read', 'thread_read', 'user_read'], ['threads', 'comments']);
	}
	
	/**
	 * @Route("/{thread}/comments/{comment}/", methods={"DELETE"})
	 * @IsGranted("MANAGE", subject="comment")
	 */
	public function delete(Thread $thread, Comment $comment)
	{
		$this->em->remove($comment);
		$this->em->flush();
		return $this->ApiResponse(null, 204); // 204 No Content
	}
	
	/**
	 * @Route("/{thread}/comments/{comment}/vote/{voteValue}/", methods={"POST"}, requirements={"voteValue"="1|0|-1"})
	 * @IsGranted("ROLE_USER")
	 * 
	 * @param int $thread Used to keep consistent routes structure but prevent useless DB query for $thread. 
	 */
	public function vote(int $thread, Comment $comment, int $voteValue, VotingService $votingService)
	{
		$votingService->submitCommentVote($comment, $voteValue);
		
		return $this->ApiResponse(null, 204);
	}
	
	// TODO add comments search
}
