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
	//public const COUNT = UserFixtures::COUNT * 20; //5; # TODO
	
    public function loadData(ObjectManager $manager)
    {
    	$f = $this->faker;
    	$users = $manager->getRepository(User::class)->findAll();
    	//$users = $this->getAllReferences(UserFixtures::USER_REFERENCE);
    	//$users = $this->getRandomReferences(UserFixtures::USER_REFERENCE, UserFixtures::COUNT);
    	$threads = $manager->getRepository(Thread::class)->findAll();
    	//$threads = $this->getAllReferences(ThreadFixtures::THREAD_REFERENCE);
    	//$threads = $this->getRandomReferences(ThreadFixtures::THREAD_REFERENCE, ThreadFixtures::COUNT);
	
    	//$loop = 0;
		foreach ($threads as $t)
		{
			foreach ($users as $u)
			{
				if ($f->boolean(70)) // % chance for each user to vote on each thread
				{
					//try
					//{
						$newVote = VoteThread::create($t, $u, $f->boolean(50));
						$manager->persist($newVote);
						//$manager->flush();
						//dump("--- LOOP --- #$loop", $u, $t, $newVote);
					//} catch (\Throwable $e) {
					//	dd($u, $t, $newVote, "loop: ".$loop, $e->getMessage());
					//}
					//$loop += 1;
				}
			}
    	}
		$manager->flush();
    	
    	/*$this->createMany(self::COUNT, self::THREAD_REFERENCE, function (int $i) use ($f, $users, $manager) {
			$thread = new Thread();
			$thread->setTitle($f->realText(rand(20, 150), 1));
			if ($f->boolean(80)) // 20% treads with empty content
			{
				if ($f->boolean(65))
					$thread->setContent($f->realText(rand(40, 1000)));
				else
					$thread->setContent($f->text(rand(40, 1000)));
				
			}
			
			// TODO REMOVE
			foreach ($users as $u)
			{
				dump($u, $thread);
				if ($this->faker->boolean(60)) // % chance for each user to vote on each thread
				{
					$newVote = VoteThread::create($thread, $u, $this->faker->boolean(65));
					$manager->persist($newVote);
				}
			}
			// TODO REMOVE
			
			//$thread->setCreatedAt($f->dateTimeBetween('-1 months', 'now'));
			$thread->setAuthor($f->randomElement($users));
			return $thread;
		});*/
    	
        //$manager->flush();
    }
}
