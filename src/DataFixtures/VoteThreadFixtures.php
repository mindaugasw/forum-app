<?php

namespace App\DataFixtures;

use App\Entity\Thread;
use App\Entity\User;
use App\Entity\VoteThread;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class VoteThreadFixtures extends BaseFixture //implements DependentFixtureInterface
{
	public const VOTE_THREAD_REFERENCE = 'voteThread';
	//public const COUNT = UserFixtures::COUNT * 20;
	
    public function loadData(ObjectManager $manager)
    {
    	$f = $this->faker;
    	$users = $manager->getRepository(User::class)->findAll();
    	//$users = $this->getAllReferences(UserFixtures::USER_REFERENCE);
    	//$users = $this->getRandomReferences(UserFixtures::USER_REFERENCE, UserFixtures::COUNT);
    	$threads = $manager->getRepository(Thread::class)->findAll();
    	//$threads = $this->getAllReferences(ThreadFixtures::THREAD_REFERENCE);
    	//$threads = $this->getRandomReferences(ThreadFixtures::THREAD_REFERENCE, ThreadFixtures::COUNT);
	
		foreach ($threads as $t)
		{
			foreach ($users as $u)
			{
				if ($f->boolean(70)) // % chance for each user to vote on each thread
				{
					$newVote = VoteThread::create($t, $u, $f->boolean(50) ? 1 : -1);
					//$this->addReference(self::VOTE_THREAD_REFERENCE.'_'.$i, $newVote);
					$manager->persist($newVote);
				}
			}
    	}
		$manager->flush();
	
		// Recount all votes
		$voteThreadRepo = $manager->getRepository(VoteThread::class);
		foreach ($threads as $t)
		{
			$t->setVotesCount($voteThreadRepo->countThreadVotes($t));
		}
		$manager->flush();
    }
}
