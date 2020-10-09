<?php

namespace App\DataFixtures;

use App\Entity\Comment;
use App\Entity\Thread;
use App\Entity\User;
use App\Entity\VoteComment;
use App\Entity\VoteThread;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;
use Faker\Generator;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class AppFixtures extends Fixture
{
	const USERS_COUNT = 10;
	const THREADS_COUNT = 100;
	const COMMENTS_COUNT = 25; // per thread, number ranges between x1-2 this number
	const VOTE_THREAD_CHANCE = 70; // chance for each user to vote on each thread 
	const VOTE_COMMENT_CHANCE = 30; // chance for each user to vote on each comment 
	
	private array $entityNames = [ // Entities to load. For each one there must be a method loadName()
		'Users',
		'Threads',
		'Comments',
		'VoteThread',
		'VoteComment',
	];
	private array $entities = []; // Store here all created objects in subarrays
	
	private ObjectManager $em;
	private UserPasswordEncoderInterface $passwordEncoder;
	private ConsoleOutput $console;
	private Generator $faker;
	
	public function __construct(UserPasswordEncoderInterface $passwordEncoder)
	{
		$this->passwordEncoder = $passwordEncoder;
		$this->console = new ConsoleOutput();
		$this->faker = Factory::create();
	}
	
	public function load(ObjectManager $manager)
    {
    	$totalStartTime = microtime(true);
    	$this->em = $manager;
		
		$i = 1; // Fixture number
		foreach ($this->entityNames as $entity)
		{
			$startTime = microtime(true);
			$fullCallback = 'load'.$entity;
			$this->$fullCallback();
			$this->em->flush();
			$endTime = microtime(true);
			
			$this->log(sprintf(
				"Successfully loaded %5d %11s in %5d ms. %d/%d fixtures done.",
				count($this->entities[strtolower($entity)]), $entity, ($endTime - $startTime) * 1000, $i++, count($this->entityNames)			
			));
		}
		$totalEndTime = microtime(true);
		
		$this->log(sprintf("All fixtures successfully loaded in %d ms.",
			($totalEndTime - $totalStartTime) * 1000));
    }
    
    private function log(string $text)
	{
		$this->console->writeln('   <comment>></comment> <info>'.$text.'</info>');
	}
    
    function loadUsers()
	{
		$hash = null; // use same hash for all users to speed up fixtures loading
		
		for ($i = 0; $i < self::USERS_COUNT; $i++)
		{
			$user = new User();
			$user->setUsername("user".($i+1));
			
			if ($hash === null)
				$hash = $this->passwordEncoder->encodePassword($user, 'password');
			$user->setPassword($hash);
			$this->entities['users'][] = $user;
			$this->em->persist($user);
		}
	}
	function loadThreads()
	{
		$f = $this->faker;
		
		for ($i = 0; $i < self::THREADS_COUNT; $i++) {
			$thread = new Thread();
			$thread->setTitle($f->realText(rand(20, 150), 1));
			if ($f->boolean(65))
				$thread->setContent($f->realText(rand(40, 300)));
			else
				$thread->setContent($f->text(rand(40, 300)));
			$thread->setAuthor($f->randomElement($this->entities['users']));
			$this->entities['threads'][] = $thread;
			$this->em->persist($thread);
		}
	}
	function loadComments()
	{
		$f = $this->faker;
		foreach ($this->entities['threads'] as $thread)
		{
			for ($i = 0; $i < $f->numberBetween(self::COMMENTS_COUNT, self::COMMENTS_COUNT * 2); $i++)
			{
				$comment = new Comment();
				if ($f->boolean(65))
					$comment->setContent($f->realText(rand(30, 150)));
				else
					$comment->setContent($f->text(rand(30, 150)));
				$comment->setAuthor($f->randomElement($this->entities['users']));
				$comment->setThread($thread);
				$this->entities['comments'][] = $comment;
				$this->em->persist($comment);
			}
		}
		
		foreach ($this->entities['comments'] as $c)
		{
			$c->getThread()->setCommentsCount($c->getThread()->getCommentsCount() + 1);
		}
	}
	function loadVoteThread()
	{
		$f = $this->faker;
		
		$allVotes = [];
		foreach ($this->entities['threads'] as $t)
		{
			foreach ($this->entities['users'] as $u)
			{
				if ($t->getAuthor() === $u)
					continue; // Prevent authors voting on their own threads
				
				if ($f->boolean(self::VOTE_THREAD_CHANCE)) // % chance for each user to vote on each thread
				{
					$newVote = VoteThread::create($t, $u, $f->boolean(70) ? 1 : -1);
					$allVotes[] = $newVote;
					$this->em->persist($newVote);
				}
			}
		}
		$this->em->flush();
		
		// Recount votes on threads
		foreach ($allVotes as $v)
		{
			$v->getThread()->setVotesCount($v->getThread()->getVotesCount() + $v->getVote());
		}
		
		$this->entities['votethread'] = $allVotes;
	}
	function loadVoteComment()
	{
		$f = $this->faker;
		
		$allVotes = [];
		foreach ($this->entities['comments'] as $c)
		{
			foreach ($this->entities['users'] as $u)
			{
				if ($c->getAuthor() === $u)
					continue; // Prevent authors voting on their own threads
				
				if ($f->boolean(self::VOTE_COMMENT_CHANCE)) // % chance for each user to vote on each thread
				{
					$newVote = VoteComment::create($c, $u, $f->boolean(70) ? 1 : -1);
					$allVotes[] = $newVote;
					$this->em->persist($newVote);
				}
			}
		}
		$this->em->flush();
		
		// Recount votes on comments
		foreach ($allVotes as $v)
		{
			$v->getComment()->setVotesCount($v->getComment()->getVotesCount() + $v->getVote());
		}
		
		$this->entities['votecomment'] = $allVotes;
	}
}
