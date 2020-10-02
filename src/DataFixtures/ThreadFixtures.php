<?php

namespace App\DataFixtures;

use App\Entity\Thread;
use App\Entity\User;
use App\Entity\VoteThread;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class ThreadFixtures extends BaseFixture //implements DependentFixtureInterface
{
	public const THREAD_REFERENCE = 'threads';
	public const COUNT = 100; // UserFixtures::COUNT * 40; //5; # TODO
	
    public function loadData(ObjectManager $manager)
    {
    	$f = $this->faker;
    	//$users = $this->getRandomReferences(UserFixtures::USER_REFERENCE, UserFixtures::COUNT);
    	//$users = $this->getAllReferences(UserFixtures::USER_REFERENCE); // Some problems with objects persisting
		$users = $manager->getRepository(User::class)->findAll();
		
		for ($i = 0; $i < self::COUNT; $i++) {
			$thread = new Thread();
			$thread->setTitle($f->realText(rand(20, 150), 1));
			//if ($f->boolean(80)) // 20% threads with empty content
			//{
			if ($f->boolean(65))
				$thread->setContent($f->realText(rand(40, 300)));
			else
				$thread->setContent($f->text(rand(40, 300)));
			//}
			$thread->setAuthor($f->randomElement($users));
			$this->addReference(self::THREAD_REFERENCE.'_'.$i, $thread);
			$manager->persist($thread);
		}
		$manager->flush();
		
    	/*$this->createMany(self::COUNT, self::THREAD_REFERENCE, function (int $i) use ($f, $users) {
			$thread = new Thread();
			$thread->setTitle($f->realText(rand(20, 150), 1));
			if ($f->boolean(80)) // 20% treads with empty content
			{
				if ($f->boolean(65))
					$thread->setContent($f->realText(rand(40, 1000)));
				else
					$thread->setContent($f->text(rand(40, 1000)));
				
			}
		
			
			//$thread->setCreatedAt($f->dateTimeBetween('-1 months', 'now'));
			$thread->setAuthor($f->randomElement($users));
			return $thread;
		});
    	
        $manager->flush();*/
    }
}
