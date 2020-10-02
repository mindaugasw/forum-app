<?php

namespace App\Repository;

use App\Entity\Thread;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Knp\Component\Pager\Event\Subscriber\Paginate\Callback\CallbackPagination;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Component\Intl\Exception\NotImplementedException;
use Symfony\Component\Security\Core\Security;

class ThreadRepository extends ServiceEntityRepository
{
	/*
	 * All overridden methods (find, findBy, findOneBy, findAll) additionally
	 * fill userVote property on Thread.
	 */
	
	/** @var VoteThreadRepository */
	private $voteThreadRepo;
	/** @var Security */
	private $security;
	/** @var PaginatorInterface */
	private $paginator;
	
	public function __construct(ManagerRegistry $registry, PaginatorInterface $paginator, VoteThreadRepository $voteThreadRepo, Security $security)
    {
        parent::__construct($registry, Thread::class);
		$this->voteThreadRepo = $voteThreadRepo;
		$this->security = $security;
		$this->paginator = $paginator;
	}
	
	/**
	 * {@InheritDoc}
	 */
	public function find($id, $lockMode = null, $lockVersion = null)
	{
		$thread = parent::find($id, $lockMode, $lockVersion);
		
		if ($thread !== null)
			$this->voteThreadRepo->addUserVoteToSingleThread($thread);
		return $thread;
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
		$threads = parent::findBy($criteria, $orderBy, $limit, $offset);
		
		if (count($threads) !== 0)
			$this->voteThreadRepo->addUserVotesToManyThreads($threads);
		return $threads;
	}
	
	public function findByPaginated(array $criteria = null, array $orderBy = null, array $pagination = []/*, bool $doCount = true*/)
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
	}
	
	/**
	 * {@InheritDoc}
	 */
	public function findOneBy(array $criteria, array $orderBy = null)
	{
		$thread = parent::findOneBy($criteria, $orderBy);
		
		if ($thread !== null)
			$this->voteThreadRepo->addUserVoteToSingleThread($thread);
		return $thread;
	}
	
	/**
	 * Perform a fulltext search on title and content columns. Uses
	 * Service\DoctrineExtensions\MatchAgainst. Supports boolean operators:
	 * https://dev.mysql.com/doc/refman/8.0/en/fulltext-boolean.html
	 *
	 * @param $searchTerm
	 * @return int|mixed|string
	 */
	public function fullTextSearch($searchTerm)
	{
		return $this->createQueryBuilder('t')
			->andWhere('MATCH_AGAINST(t.title, t.content) AGAINST(:searchterm boolean)>0')
			->setParameter('searchterm', $searchTerm)
			->getQuery()
			->getResult()
			;
		// TODO add pagination
		// TODO add userVote
	}
	
	

    // /**
    //  * @return Thread[] Returns an array of Thread objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('t.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Thread
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
