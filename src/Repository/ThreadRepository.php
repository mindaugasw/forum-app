<?php

namespace App\Repository;

use App\Entity\Thread;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\Criteria;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Component\Intl\Exception\NotImplementedException;
use Symfony\Component\Security\Core\Security;

/**
 * method Thread|null find($id, $lockMode = null, $lockVersion = null)
 * method Thread|null findOneBy(array $criteria, array $orderBy = null)
 * method Thread[]    findAll()
 * method Thread[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ThreadRepository extends ServiceEntityRepository
{
	/**
	 * @var VoteThreadRepository
	 */
	private $voteThreadRepo;
	/**
	 * @var Security
	 */
	private $security;
	/**
	 * @var PaginatorInterface
	 */
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
			$this->addSingleUserVote($thread);
		return $thread;
	}
	
	/**
	 * {@InheritDoc}
	 */
	public function findAll()
	{
		//return parent::findAll();
		//$user = $this->security->getUser();
		//$userId = $user !== null ? $user->getId() : -1 ;
		
		/*SELECT
			thread.*,
			vote_thread.vote AS userVote
		FROM
			thread
		LEFT JOIN vote_thread ON thread.id = vote_thread.thread_id AND vote_thread.user_id = 30566
		WHERE
			thread.id = 8760*/		
		// TODO: write plain query and check working first
		// then do with QueryBuilder
		
		// https://stackoverflow.com/questions/18357159/how-to-perform-a-join-query-using-symfony-and-doctrine-query-builder
		// https://www.google.com/search?sxsrf=ALeKk03NmWZhQLhpucnSQoDfOiQ6lDeZrg%3A1600981981103&ei=3QttX6f2BZe43APolKp4&q=symfony+query+builder+select+as&oq=symfony+query+builder+select+as&gs_lcp=CgZwc3ktYWIQAxgAMgYIABAWEB46BAgAEEc6BAgjECc6AggAOgQIABBDSgUIJhIBblDhFliKKmCpL2gAcAF4AIABaIgBvASSAQM1LjGYAQCgAQGqAQdnd3Mtd2l6yAEIwAEB&sclient=psy-ab
		// https://stackoverflow.com/questions/18970941/how-to-select-fields-using-doctrine-2-query-builder
		// http://www.inanzzz.com/index.php/post/4ern/writing-doctrine-query-builder-without-relations-between-entities
		
		/*return $this->createQueryBuilder('t')
			->select('t, vt.vote')
			->leftJoin('App\Entity\VoteThread', 'vt', 'ON', 't.id = vt.thread_id AND vt.user_id = :uid')
			->setParameters(['uid' => $userId])
			->getQuery();*/
		
		
		// Native query building
		// https://www.doctrine-project.org/projects/doctrine-orm/en/2.7/reference/native-sql.html
		
		//$em = $this->getEntityManager();
		/*$rsm = new ResultSetMappingBuilder($em);
		$rsm->addRootEntityFromClassMetadata('App\Entity\Thread', 't');
		$rsm->addFieldResult('t', 'user_vote', 'userVote');
		$query = $em->createNativeQuery('$sql', '$rsm');*/
		//$query->get
		
		/*$dql = $em->createQuery('SELECT thread.*, IFNULL(vote_thread.vote, 0) AS user_vote FROM thread LEFT JOIN vote_thread ON thread.id = vote_thread.thread_id AND vote_thread.user_id = 30566 WHERE thread.id = 8760');
		$x = $dql->getResult();
		return $x;*/
		
		return $this->findBy([]);
	}
	
	public function findAllPaginated()
	{
		return $this->findByPaginated();
	}
	
	/**
	 * {@InheritDoc}
	 */
	public function findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
	{
		$threads = parent::findBy($criteria, $orderBy, $limit, $offset);
		
		if (count($threads) !== 0)
			$this->addMultipleUserVotes($threads);
		return $threads;
	}
	
	/**
	 * @param array|null $criteria
	 * @param array|null $orderBy
	 * @param int $page
	 * @param null $perPage
	 * @return \Knp\Component\Pager\Pagination\PaginationInterface
	 */
	public function findByPaginated(array $criteria = null, array $orderBy = null, $page = 1, $perPage = null)
	{
		// findBy QueryBuilder code from: https://github.com/doctrine/orm/issues/7833
		$queryBuilder = $this->createQueryBuilder('t');
		
		foreach ($criteria ?: [] as $key => $value) {
			if (\is_array($value)) {
				$exp = $queryBuilder->expr()->in("t.{$key}", ":{$key}");
			} else {
				$exp = $queryBuilder->expr()->eq("t.{$key}", ":{$key}");
			}
			
			$queryBuilder
				->andWhere($exp)
				->setParameter($key, $value);
		}
		
		foreach ($orderBy ?: [] as $sort => $order) {
			$queryBuilder->orderBy("t.{$sort}", $order);
		}
		
		$query = $queryBuilder->getQuery();
		
		$pagination = $this->paginator->paginate($query, $page, $perPage);
		
		if ($pagination->count() !== 0)
			$this->addMultipleUserVotes($pagination->getItems());
		return $pagination;
	}
	
	/**
	 * {@InheritDoc}
	 */
	public function findOneBy(array $criteria, array $orderBy = null)
	{
		$thread = parent::findOneBy($criteria, $orderBy);
		
		if ($thread !== null)
			$this->addSingleUserVote($thread);
		return $thread;
	}
	
	/**
	 * Adds userVote property to given thread.
	 * 
	 * @param Thread $thread
	 * @return Thread
	 */
	private function addSingleUserVote(Thread $thread)
	{
		$user = $this->security->getUser();
		if ($user !== null) {
			$userVote = $this->voteThreadRepo->findOneBy(['thread' => $thread, 'user' => $user]);
			if ($userVote !== null)
				$userVote->setUserVoteOnThread();
		}
		
		return $thread;
	}
	
	/**
	 * Adds userVote property to all given threads.
	 * 
	 * @param array $threads
	 * @return array
	 */
	private function addMultipleUserVotes(array $threads)
	{
		$user = $this->security->getUser();
		if ($user !== null) {
			$userVotes = $this->voteThreadRepo->findBy(['user' => $user, 'thread' => $threads]);
			
			for ($i = 0; $i < count($userVotes); $i++) {
				$userVotes[$i]->setUserVoteOnThread();
			}
		}
		return $threads;
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
