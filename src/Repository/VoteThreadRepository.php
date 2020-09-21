<?php

namespace App\Repository;

use App\Entity\VoteThread;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

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
