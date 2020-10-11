<?php


namespace App\Service;


use App\Entity\Comment;
use App\Entity\Thread;
use App\Entity\User;
use App\Entity\VoteComment;
use App\Entity\VoteThread;
use App\Exception\ApiBadRequestException;
use App\Exception\ApiServerException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Security;

class VotingService
{
	private EntityManagerInterface $em;
	private ?User $user;
	
	public function __construct(EntityManagerInterface $em, Security $security)
	{
		$this->em = $em;
		$this->user = $security->getUser();
	}
	
	/**
	 * @param Thread $thread
	 * @param int $voteValue
	 * @param bool $flushDb Should $em->flush() be called in this method?
	 * @return Thread
	 */
	public function submitThreadVote(Thread $thread, int $voteValue, bool $flushDb = true)
	{
		if ($voteValue !== 1 && $voteValue !== 0 && $voteValue !== -1)
			throw new ApiBadRequestException('Not allowed vote value: '.$voteValue);
		
		if ($this->user === null)
			throw new ApiServerException('Tried to vote while unauthorized.');
		
		if ($thread->getAuthor() === $this->user)
			throw new ApiBadRequestException('Voting on your own threads is not allowed.');
		
		$voteThreadRepo = $this->em->getRepository(VoteThread::class);
		$vote = $voteThreadRepo->findOneBy(['thread' => $thread, 'user' => $this->user]);
		$threadVotesCount = $voteThreadRepo->countThreadVotes($thread);
		$voteValueChange = 0; // How much total votes count will change. Needed to avoid 2 DB flushes just for votes counting.
		
		if ($vote === null) // Create new vote
		{
			$vote = VoteThread::create($thread, $this->user, $voteValue);
			$this->em->persist($vote);
			$voteValueChange = $voteValue;
		}
		else // Vote already exists, update it
		{
			$voteValueChange = $voteValue - $vote->getVote();
			$vote->setVote($voteValue);
		}
		
		$thread->setVotesCount($threadVotesCount + $voteValueChange);
		
		if ($flushDb)
			$this->em->flush();
		
		return $thread;
	}
	
	/**
	 * @param Comment $comment
	 * @param int $voteValue
	 * @param bool $flushDb Should $em->flush() be called in this method?
	 * @return Comment
	 */
	public function submitCommentVote(Comment $comment, int $voteValue, bool $flushDb = true)
	{
		if ($voteValue !== 1 && $voteValue !== 0 && $voteValue !== -1)
			throw new ApiBadRequestException('Not allowed vote value: '.$voteValue);
		
		if ($this->user === null)
			throw new ApiServerException('Tried to vote while unauthorized.');
		
		if ($comment->getAuthor() === $this->user)
			throw new ApiBadRequestException('Voting on your own comments is not allowed.');
		
		$voteCommentRepo = $this->em->getRepository(VoteComment::class);
		$vote = $voteCommentRepo->findOneBy(['comment' => $comment, 'user' => $this->user]);
		$commentVotesCount = $voteCommentRepo->countCommentVotes($comment);
		$voteValueChange = 0; // How much total votes count will change. Needed to avoid 2 DB flushes just for votes counting.
		
		if ($vote === null) // Create new vote
		{
			$vote = VoteComment::create($comment, $this->user, $voteValue);
			$this->em->persist($vote);
			$voteValueChange = $voteValue;
		}
		else // Vote already exists, update it
		{
			$voteValueChange = $voteValue - $vote->getVote();
			$vote->setVote($voteValue);
		}
		
		$comment->setVotesCount($commentVotesCount + $voteValueChange);
		
		if ($flushDb)
			$this->em->flush();
		
		return $comment;
	}
	
	/**
	 * Sets userVote property on given thread.
	 *
	 * @param Thread $thread
	 * @return Thread
	 */
	public function addUserVoteToSingleThread(Thread $thread)
	{
		if ($this->user !== null) {
			$userVote = $this->em->getRepository(VoteThread::class)->findOneBy(['thread' => $thread, 'user' => $this->user]);
			if ($userVote !== null)
				$userVote->setUserVoteOnThread();
		}
		
		return $thread;
	}
	
	/**
	 * Sets userVote property on all given threads.
	 *
	 * @param array $threads
	 * @return array
	 */
	public function addUserVotesToManyThreads(array $threads)
	{
		if ($this->user !== null) {
			$userVotes = $this->em->getRepository(VoteThread::class)->findBy(['thread' => $threads, 'user' => $this->user]);
			
			for ($i = 0; $i < count($userVotes); $i++) {
				$userVotes[$i]->setUserVoteOnThread();
			}
		}
		return $threads;
	}
	
	/**
	 * Sets userVote property on given comment.
	 *
	 * @param Comment $comment
	 * @return Comment
	 */
	public function addUserVoteToSingleComment(Comment $comment)
	{
		if ($this->user !== null) {
			$userVote = $this->em->getRepository(VoteComment::class)->findOneBy(['comment' => $comment, 'user' => $this->user]);
			if ($userVote !== null)
				$userVote->setUserVoteOnComment();
		}
		
		return $comment;
	}
	
	/**
	 * Sets userVote property on all given comments.
	 *
	 * @param array $comments
	 * @return array
	 */
	public function addUserVotesToManyComments(array $comments)
	{
		if ($this->user !== null) {
			$userVotes = $this->em->getRepository(VoteComment::class)->findBy(['comment' => $comments, 'user' => $this->user]);
			
			for ($i = 0; $i < count($userVotes); $i++) {
				$userVotes[$i]->setUserVoteOnComment();
			}
		}
		return $comments;
	}
	
}