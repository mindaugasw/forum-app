<?php

namespace App\DataFixtures;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Entity\User;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class CommentFixtures extends BaseFixture //implements DependentFixtureInterface
{
	public const COMMENT_REFERENCE = 'comments';
	//public const COUNT = ThreadFixtures::COUNT * 5;
	
    public function loadData(ObjectManager $manager)
    {
		$f = $this->faker;
		//$users = $this->getRandomReferences(UserFixtures::USER_REFERENCE, UserFixtures::COUNT);
		$users = $manager->getRepository(User::class)->findAll();
		//$threads = $this->getRandomReferences(ThreadFixtures::THREAD_REFERENCE, ThreadFixtures::COUNT);
		$threads = $manager->getRepository(Thread::class)->findAll();
	
		foreach ($users as $user)
		{
			foreach ($threads as $thread)
			{
				if ($f->boolean(25)) { // % chance for each user to comment on each thread 
					$comment = new Comment();
					if ($f->boolean(65))
						$comment->setContent($f->realText(rand(30, 300)));
					else
						$comment->setContent($f->text(rand(30, 300)));
					
					$comment->setAuthor($user);
					$comment->setThread($thread);
					//$this->addReference(self::COMMENT_REFERENCE.'_'.$i, $comment);
					$manager->persist($comment);
				}
			}
		}
		
		$manager->flush();
		
		/*$this->createMany(self::COUNT, self::COMMENT_REFERENCE, function (int $i) use ($f, $users, $threads) {
			$comment = new Comment();
			if ($f->boolean(65))
				$comment->setContent($f->realText(rand(40, 1000)));
			else
				$comment->setContent($f->text(rand(40, 1000)));
			
			$comment->setAuthor($f->randomElement($users));
			$comment->setThread($f->randomElement($threads));
			return $comment;
		});
	
		$manager->flush();*/
    }
}
