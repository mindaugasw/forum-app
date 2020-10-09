<?php

namespace App\Repository;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Service\VotingService;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Knp\Component\Pager\Event\Subscriber\Paginate\Callback\CallbackPagination;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Component\Security\Core\Security;

class CommentRepository extends ServiceEntityRepository
{
	/*
	 * All overridden methods (find, findBy, findOneBy, findAll) additionally
	 * fill userVote property on Comment.
	 */
	
	/** @var PaginatorInterface */
	private $paginator;
	/** @var VotingService */
	private $votingService;
	
	public function __construct(ManagerRegistry $registry, PaginatorInterface $paginator, VotingService $votingService)
    {
        parent::__construct($registry, Comment::class);
		$this->paginator = $paginator;
		$this->votingService = $votingService;
	}
	
	/**
	 * {@InheritDoc}
	 */
	public function find($id, $lockMode = null, $lockVersion = null)
	{
		$comment = parent::find($id, $lockMode, $lockVersion);
		
		if ($comment !== null)
			$this->votingService->addUserVoteToSingleComment($comment);
		return $comment;
	}
	
	/**
	 * {@InheritDoc}
	 */
	public function findAll()
	{
		return $this->findBy([]);
	}
	
	/**
	 * {@InheritDoc}
	 */
	public function findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
	{
		$comments = parent::findBy($criteria, $orderBy, $limit, $offset);
		
		if (count($comments) !== 0)
			$this->votingService->addUserVotesToManyComments($comments);
		return $comments;
	}
	
	/*public function findByPaginated(array $criteria = null, array $orderBy = null, array $pagination = []/*, bool $doCount = true/)
	{
		$repo = $this;
		
		// from https://github.com/KnpLabs/knp-components/blob/master/docs/pager/intro.md#custom-data-repository-pagination
		$countFunc = function () use ($repo, $criteria) {
			return $repo->count($criteria);
			// TODO implement checking if doCount is true
			// Results should not be counted on expensive queries (full text search)
			
			// TODO create a custom paginator to use with unknown total items count
		};
		$itemsFunc = function ($offset, $limit) use ($repo, $criteria, $orderBy) {
			return $repo->findBy($criteria, $orderBy, $limit, $offset);
		};
		
		$target = new CallbackPagination($countFunc, $itemsFunc);
		return $this->paginator->paginate($target, $pagination['page'], $pagination['perpage']);
	}*/
	
	/**
	 * {@InheritDoc}
	 */
	public function findOneBy(array $criteria, array $orderBy = null)
	{
		$comment = parent::findOneBy($criteria, $orderBy);
		
		if ($comment !== null)
			$this->votingService->addUserVoteToSingleComment($comment);
		return $comment;
	}
	
	/**
	 * Perform a fulltext search on content column. Uses
	 * Service\DoctrineExtensions\MatchAgainst. Supports boolean operators:
	 * https://dev.mysql.com/doc/refman/8.0/en/fulltext-boolean.html
	 *
	 * @param $searchTerm
	 * @return int|mixed|string
	 */
	public function fullTextSearch($searchTerm)
	{
		return $this->createQueryBuilder('c')
			->andWhere('MATCH_AGAINST(c.content) AGAINST(:searchterm boolean)>0')
			->setParameter('searchterm', $searchTerm)
			->getQuery()
			->getResult()
			;
		// TODO add pagination
		// TODO add userVote
	}
	
	/**
	 * Count comments on given thread.
	 * 
	 * @param Thread $thread
	 * @return int|mixed|string
	 * @throws \Doctrine\ORM\NoResultException
	 * @throws \Doctrine\ORM\NonUniqueResultException
	 */
	public function countCommentsOnThread(Thread $thread)
	{
		return $this->createQueryBuilder('c')
			->select('COUNT(c.id) AS TOTAL_COUNT')
			->andWhere('c.thread = :t')
			->setParameter('t', $thread->getId())
			->getQuery()
			->getSingleScalarResult();
	}
	
}
