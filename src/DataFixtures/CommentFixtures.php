<?php

namespace App\DataFixtures;

use App\Entity\Comment;
use App\Entity\Thread;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class CommentFixtures extends BaseFixture //implements DependentFixtureInterface
{
	public const COMMENT_REFERENCE = 'comments';
	public const COUNT = ThreadFixtures::COUNT * 5;
	
    public function loadData(ObjectManager $manager)
    {
		$f = $this->faker;
		$users = $this->getRandomReferences(UserFixtures::USER_REFERENCE, UserFixtures::COUNT);
		$threads = $this->getRandomReferences(ThreadFixtures::THREAD_REFERENCE, ThreadFixtures::COUNT);
		
		$this->createMany(self::COUNT, self::COMMENT_REFERENCE, function (int $i) use ($f, $users, $threads) {
			$comment = new Comment();
			if ($f->boolean(65))
				$comment->setContent($f->realText(rand(40, 1000)));
			else
				$comment->setContent($f->text(rand(40, 1000)));
			
			$comment->setCreatedAt($f->dateTimeBetween('-1 months', 'now'));
			//$comment->setAuthor($users[rand(0, UserFixtures::COUNT-1)]);
			$comment->setAuthor($f->randomElement($users));
			$comment->setThread($f->randomElement($threads));
			return $comment;
		});
	
		$manager->flush();
    }
}
