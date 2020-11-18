<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Entity\User;
use App\Service\EntitiesCRUD\CommentCRUD;
use App\Service\VotingService;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/threads")
 */
class CommentController extends BaseApiController
{
	private CommentCRUD $commentCRUD;
	
	public function __construct(CommentCRUD $commentCRUD)
	{
		parent::__construct();
		$this->commentCRUD = $commentCRUD;
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
		$data = $this->commentCRUD->getList($thread, $request);
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
	 * @IsGranted(User::ROLE_USER)
	 */
	public function createNew(Thread $thread, Request $request)
	{
		$comment = $this->commentCRUD->createNew($thread, $request);
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
		$comment = $this->commentCRUD->edit($comment, $request);
		$this->em->flush();
		return $this->ApiResponse($comment, 200, ['comment_read', 'thread_read', 'user_read'], ['threads', 'comments']);
	}
	
	/**
	 * @Route("/{thread}/comments/{comment}/", methods={"DELETE"})
	 * @IsGranted("MANAGE", subject="comment")
	 */
	public function delete(Thread $thread, Comment $comment)
	{
		$this->commentCRUD->delete($thread);
		$this->em->remove($comment);
		$this->em->flush();
		return $this->ApiResponse(null, 204);
	}
	
	/**
	 * @Route("/{thread}/comments/{comment}/vote/{voteValue}/", methods={"POST"}, requirements={"voteValue"="1|0|-1"})
	 * @IsGranted(User::ROLE_USER)
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
