<?php

namespace App\DataFixtures;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Entity\User;
use App\Entity\VoteComment;
use App\Entity\VoteThread;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class VoteCommentFixtures extends BaseFixture //implements DependentFixtureInterface
{
	public const VOTE_THREAD_REFERENCE = 'voteThread';
	//public const COUNT = UserFixtures::COUNT * 20;
	
    public function loadData(ObjectManager $manager)
    {
    	$f = $this->faker;
    	$users = $manager->getRepository(User::class)->findAll();
    	$comments = $manager->getRepository(Comment::class)->findAll();
	
		foreach ($comments as $c)
		{
			foreach ($users as $u)
			{
				if ($c->getAuthor() === $u)
					continue; // Prevent authors voting on their own comments
				
				if ($f->boolean(70)) // % chance for each user to vote on each comment
				{
					$newVote = VoteComment::create($c, $u, $f->boolean(70) ? 1 : -1);
					//$this->addReference(self::VOTE_THREAD_REFERENCE.'_'.$i, $newVote);
					$manager->persist($newVote);
				}
			}
    	}
		$manager->flush();
		
		// Recount all votes
		$allVotes = $manager->getRepository(VoteComment::class)->findAll();
	
		foreach ($allVotes as $v)
		{
			$v->getComment()->setVotesCount($v->getComment()->getVotesCount() + $v->getVote());
		
			//$t->setVotesCount($voteThreadRepo->countThreadVotes($t));
		}
		$manager->flush();
    }
}
