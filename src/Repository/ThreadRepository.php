<?php

namespace App\Repository;

use App\Entity\Thread;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Collections\Criteria;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Intl\Exception\NotImplementedException;
use Symfony\Component\Security\Core\Security;

/**
 * method Thread|null find($id, $lockMode = null, $lockVersion = null)
 * method Thread|null findOneBy(array $criteria, array $orderBy = null)
 * @method Thread[]    findAll()
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
	
	public function __construct(ManagerRegistry $registry, VoteThreadRepository $voteThreadRepo, Security $security)
    {
        parent::__construct($registry, Thread::class);
		$this->voteThreadRepo = $voteThreadRepo;
		$this->security = $security;
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
	public function findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
	{
		$threads = parent::findBy($criteria, $orderBy, $limit, $offset);
		
		if (count($threads) !== 0)
			$this->addMultipleUserVotes($threads);
		return $threads;
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
	
	public function matching(Criteria $criteria)
	{
		throw new NotImplementedException("'matching' method not implemented to include userVote property.");
		return parent::matching($criteria);
	}
	
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
