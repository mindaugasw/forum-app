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
	public const COUNT = 25; // Minimum number of comments per thread. Number ranges between x1-2
	
    public function loadData(ObjectManager $manager)
    {
		$f = $this->faker;
		//$users = $this->getRandomReferences(UserFixtures::USER_REFERENCE, UserFixtures::COUNT);
		$users = $manager->getRepository(User::class)->findAll();
		//$threads = $this->getRandomReferences(ThreadFixtures::THREAD_REFERENCE, ThreadFixtures::COUNT);
		$threads = $manager->getRepository(Thread::class)->findAll();
	
		foreach ($threads as $thread)
		{
			for ($i = 0; $i < $f->numberBetween(self::COUNT, self::COUNT * 2); $i++)
			{
				$comment = new Comment();
				if ($f->boolean(65))
					$comment->setContent($f->realText(rand(30, 150)));
				else
					$comment->setContent($f->text(rand(30, 150)));
				$comment->setAuthor($f->randomElement($users));
				$comment->setThread($thread);
				$manager->persist($comment);
			}
		}
		
		$manager->flush();
		
		// Recount thread comments number
		$allComments = $manager->getRepository(Comment::class)->findAll();
		
		foreach ($allComments as $c)
		{
			$c->getThread()->setCommentsCount($c->getThread()->getCommentsCount() + 1);
		}
		$manager->flush();
    }
}
