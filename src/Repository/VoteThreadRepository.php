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
	public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VoteThread::class);
	}
	
	/**
	 * Count total votes sum on given thread.
	 * 
	 * @param Thread $thread
	 * @return int|mixed|string
	 * @throws \Doctrine\ORM\NoResultException
	 * @throws \Doctrine\ORM\NonUniqueResultException
	 */
    public function countThreadVotes(Thread $thread)
	{
		return $this->createQueryBuilder('vt')
			->select('SUM(vt.vote) as TOTAL_SUM')
			->andWhere('vt.thread = :t')
			->setParameter('t', $thread->getId())
			->getQuery()
			->getSingleScalarResult();
	}
	
}
