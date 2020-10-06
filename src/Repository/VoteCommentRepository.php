<?php

namespace App\Repository;

use App\Entity\Comment;
use App\Entity\VoteComment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Security;

/**
 * @method VoteComment|null find($id, $lockMode = null, $lockVersion = null)
 * @method VoteComment|null findOneBy(array $criteria, array $orderBy = null)
 * @method VoteComment[]    findAll()
 * @method VoteComment[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class VoteCommentRepository extends ServiceEntityRepository
{
	/** @var Security */
	private $security;
	
	public function __construct(ManagerRegistry $registry, Security $security)
    {
        parent::__construct($registry, VoteComment::class);
		$this->security = $security;
	}
	
	/**
	 * Count total votes sum on given comment.
	 *
	 * @param Comment $comment
	 * @return int|mixed|string
	 * @throws \Doctrine\ORM\NoResultException
	 * @throws \Doctrine\ORM\NonUniqueResultException
	 */
	public function countCommentVotes(Comment $comment)
	{
		return $this->createQueryBuilder('vc')
			->select('SUM(vc.vote) as TOTAL_SUM')
			->andWhere('vc.comment = :c')
			->setParameter('c', $comment->getId())
			->getQuery()
			->getSingleScalarResult();
	}
    
}
