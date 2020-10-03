<?php

namespace App\Repository;

use App\Entity\Thread;
use App\Entity\VoteThread;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Security;

/**
 * @method VoteThread|null find($id, $lockMode = null, $lockVersion = null)
 * @method VoteThread|null findOneBy(array $criteria, array $orderBy = null)
 * @method VoteThread[]    findAll()
 * @method VoteThread[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VoteThreadRepository extends ServiceEntityRepository
{
	/** @var Security */
	private $security;
	
	public function __construct(ManagerRegistry $registry, Security $security)
    {
        parent::__construct($registry, VoteThread::class);
		$this->security = $security;
	}
	
	/**
	 * Adds userVote property to given thread.
	 *
	 * @param Thread $thread
	 * @return Thread
	 */
	public function addUserVoteToSingleThread(Thread $thread)
	{
		$user = $this->security->getUser();
		if ($user !== null) {
			$userVote = $this->findOneBy(['thread' => $thread, 'user' => $user]);
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
	public function addUserVotesToManyThreads(array $threads)
	{
		$user = $this->security->getUser();
		if ($user !== null) {
			$userVotes = $this->findBy(['user' => $user, 'thread' => $threads]);
			
			for ($i = 0; $i < count($userVotes); $i++) {
				$userVotes[$i]->setUserVoteOnThread();
			}
		}
		return $threads;
	}
    
    public function countThreadVotes(Thread $thread)
	{
		return $this->createQueryBuilder('vt')
			->select('SUM(vt.vote) as TOTAL_SUM')
			->andWhere('vt.thread = :t')
			->setParameter('t', $thread->getId())
			->getQuery()
			->getSingleScalarResult();
	}

    // /**
    //  * @return VoteThread[] Returns an array of VoteThread objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('v.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?VoteThread
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
