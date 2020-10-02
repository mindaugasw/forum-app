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
	 * Adds userVote property to given thread.
	 *
	 * @param Comment $comment
	 * @return Comment
	 */
	public function addUserVoteToSingleComment(Comment $comment)
	{
		$user = $this->security->getUser();
		if ($user !== null) {
			$userVote = $this->findOneBy(['comment' => $comment, 'user' => $user]);
			if ($userVote !== null)
				$userVote->setUserVoteOnComment();
		}
		
		return $comment;
	}
	
	/**
	 * Adds userVote property to all given comments.
	 *
	 * @param array $comments
	 * @return array
	 */
	public function addUserVotesToManyComments(array $comments)
	{
		$user = $this->security->getUser();
		if ($user !== null) {
			$userVotes = $this->findBy(['user' => $user, 'comment' => $comments]);
			
			for ($i = 0; $i < count($userVotes); $i++) {
				$userVotes[$i]->setUserVoteOnComment();
			}
		}
		return $comments;
	}
    

    // /**
    //  * @return VoteComment[] Returns an array of VoteComment objects
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
    public function findOneBySomeField($value): ?VoteComment
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
