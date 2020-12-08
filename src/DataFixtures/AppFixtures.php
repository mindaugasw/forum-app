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
use phpDocumentor\Reflection\Types\Boolean;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class AppFixtures extends Fixture
{
	
	const USERS_NUMBERED_COUNT = 10; // Numbered users, e.g. user5
	const USERS_NUMBERED_ADMIN_COUNT = 3; // How many admins in USERS_COUNT?
	const USERS_NAMED_COUNT = 100; // Named users, e.g. John.Smith
	const THREADS_COUNT_MAX = 100;
	
	
	private array $entities = []; // Store here all created objects, in sub-arrays
	const USERS_KEY = 'users'; // Entity sub-array keys in $entities index
	const THREADS_KEY = 'threads';
	const COMMENTS_KEY = 'comments';
	const THREAD_VOTES_KEY = 'threadVotes';
	const COMMENT_VOTES_KEY = 'commentVotes';
	
	
	private array $fixturesConfig = [
		/*'exampleStructure' => [
			'name' => 'Cars', // Used only in console output
			'callback' => 'loadCars', // Objects generator function. Should persist objects, but not necessary to flush. Should return created objects count.
			'args' => [ // will be passed to callback function
				'count' => 5
				'carsKey' => 'CARS', // sub-array key in $entities, where to add new objects
			]
		],*/
		'numberedUsers' => [
			'name' => 'Numbered Users',
			'callback' => 'loadNumberedUsers',
			'args' => [
				'usersKey' => self::USERS_KEY,
				'count' => self::USERS_NUMBERED_COUNT,
				'adminCount' => self::USERS_NUMBERED_ADMIN_COUNT,
				'password' => 'password', // Same password for all accounts
			]
		],
		'namedUsers' => [
			'name' => 'Named Users',
			'callback' => 'loadNamedUsers',
			'args' => [
				'usersKey' => self::USERS_KEY,
				'count' => self::USERS_NAMED_COUNT,
				'password' => 'password', // Same password for all accounts
			]
		],
		/*'threadsRandom' => [ // Threads with random titles
			'name' => 'Random Threads',
			'callback' => 'loadThreadsRandom',
			'args' => [
				'count' => self::THREADS_COUNT,
				'usersKey' => self::USERS_KEY,
			]
		],*/
		'threadsFromFile' => [ // Threads with titles from ./data/threadTitles.txt
			'name' => 'Threads (file)',
			'callback' => 'loadThreadsFromFile',
			'args' => [
				'titlesFile' => './src/DataFixtures/data/threadTitles.txt',
				'threadsKey' => self::THREADS_KEY,
				'usersKey' => self::USERS_KEY,
				'maxCount' => self::THREADS_COUNT_MAX,
			]
		],
		'comments' => [
			'name' => 'Comments',
			'callback' => 'loadComments',
			'args' => [
				'commentsKey' => self::COMMENTS_KEY,
				'usersKey' => self::USERS_KEY,
				'threadsKey' => self::THREADS_KEY,
			]
		],
		'threadVotes' => [
			'name' => 'Thread Votes',
			'callback' => 'loadVotes',
			'args' => [
				'isThreads' => true,
				'postsKey' => self::THREADS_KEY,
				'usersKey' => self::USERS_KEY,
				'votesKey' => self::THREAD_VOTES_KEY,
				'breakpoints' => 3,
			]
		],
		'commentVotes' => [
			'name' => 'Comment Votes',
			'callback' => 'loadVotes',
			'args' => [
				'isThreads' => false,
				'postsKey' => self::COMMENTS_KEY,
				'usersKey' => self::USERS_KEY,
				'votesKey' => self::COMMENT_VOTES_KEY,
				'breakpoints' => 20,
			]
		],
	];
	
	
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
		$this->em->getConnection()->getConfiguration()->setSQLLogger(null); // slightly improves performance
		
		$i = 1; // Fixture number
		foreach ($this->fixturesConfig as $entity)
		{
			$startTime = microtime(true);
			$funcName = $entity['callback'];
			
			$count = $this->$funcName($entity['args']);
			
			$this->em->flush();
			$endTime = microtime(true);
			
			$this->log(sprintf(
				"Loaded %5s %15s in %5.2f s. %d/%d fixtures done.",
				number_format($count, 0, '.', ' '), // Loaded objects count 
				$entity['name'], // Entity name
				$endTime - $startTime, // Time taken, s
				$i++, // Fixtures done
				count($this->fixturesConfig) // Total fixtures			
			));
		}
		$totalEndTime = microtime(true);
		
		$this->log(sprintf("All fixtures successfully loaded in %.2f s.",
			$totalEndTime - $totalStartTime));
	}
	
    private function log(string $text)
	{
		$this->console->writeln('   <comment>></comment> <info>'.$text.'</info>');
	}
    
	public function loadNumberedUsers(array $args) {
		$count = $args['count'];
		$adminsCount = $args['adminCount'];
		$password = $args['password'];
		$usersKey = $args['usersKey'];
		
		
		$hash = null; // use same hash for all users to speed up fixtures loading
		
		for ($i = 0; $i < $count; $i++)
		{
			$user = new User();
			$user->setUsername("user".($i+1));
			
			if ($hash === null)
				$hash = $this->passwordEncoder->encodePassword($user, $password);
			$user->setPassword($hash);
			
			if ($i < $adminsCount)
				$user->setRoles([User::ROLE_ADMIN]);
			
			$this->entities[$usersKey][] = $user;
			$this->em->persist($user);
		}
		
		return $count;
	}
	
	public function loadNamedUsers(array $args) 
	{
		$count = $args['count'];
		$password = $args['password'];
		$usersKey = $args['usersKey'];
		
		$hash = null; // use same hash for all users to speed up fixtures loading
		
		$names = [];
		for ($i = 0; $i < $count; $i++)
			$names[] = $this->faker->firstName.'.'.$this->faker->lastName;
		
		$names = array_unique($names);
		
		for ($i = 0; $i < count($names); $i++)
		{
			$user = new User();
			$user->setUsername($names[$i]);
			
			if ($hash === null)
				$hash = $this->passwordEncoder->encodePassword($user, $password);
			$user->setPassword($hash);
			
			$this->entities[$usersKey][] = $user;
			$this->em->persist($user);
		}
		
		return $count;
	}
	
	public function loadThreadsRandom(array $args)
	{
		$count = $args['count'];
		$usersKey = $args['usersKey'];
		$threadsKey = $args['threadsKey'];
		
		$f = $this->faker;
		
		for ($i = 0; $i < $count; $i++) {
			$thread = new Thread();
			$thread->setTitle($f->realText(rand(20, 150), 1));
			if ($f->boolean(65))
				$thread->setContent($f->realText(rand(40, 300)));
			else
				$thread->setContent($f->text(rand(40, 300)));
			$thread->setAuthor($f->randomElement($this->entities[$usersKey]));
			$this->entities[$threadsKey][] = $thread;
			$this->em->persist($thread);
		}
		
		return $count;
	}
	
	public function loadThreadsFromFile(array $args)
	{
		$titlesFile = $args['titlesFile'];
		$threadsKey = $args['threadsKey'];
		$usersKey = $args['usersKey'];
		$maxCount = $args['maxCount'];
		
		$f = $this->faker;
		$titles = [];
		
		$file = new \SplFileObject($titlesFile);
		while (!$file->eof())
			$titles[] = $file->fgets();
		array_shift($titles); // remove file header line
		shuffle($titles);
		
		// Set createdAt, updatedAt using reflection to keep setters private
		$createdAtProp = new \ReflectionProperty(Thread::class, 'createdAt');
		$createdAtProp->setAccessible(true);
		$updatedAtProp = new \ReflectionProperty(Thread::class, 'updatedAt');
		$updatedAtProp->setAccessible(true);
		
		
		$limit = min($maxCount, count($titles));
		for ($i = 0; $i < $limit; $i++)
		{
			$thread = new Thread();
			$thread->setTitle($titles[$i]);
			
			$thread->setContent($this->randomPostContent());
			$thread->setAuthor($f->randomElement($this->entities[$usersKey]));
			
			$newDate = $f->dateTimeBetween($startDate = '-1 month');
			$createdAtProp->setValue($thread, $newDate);
			$updatedAtProp->setValue($thread, $newDate);
			
			$this->entities[$threadsKey][] = $thread;
			$this->em->persist($thread);
		}
		
		return count($titles);
	}
	
	public function loadComments(array $args)
	{
		$commentsKey = $args['commentsKey'];
		$threadsKey = $args['threadsKey'];
		$usersKey = $args['usersKey'];
		$f = $this->faker;
		
		// Set createdAt, updatedAt using reflection to keep setters private
		$createdAtProp = new \ReflectionProperty(Comment::class, 'createdAt');
		$createdAtProp->setAccessible(true);
		$updatedAtProp = new \ReflectionProperty(Comment::class, 'updatedAt');
		$updatedAtProp->setAccessible(true);
		
		$totalCount = 0;
		
		foreach ($this->entities[$threadsKey] as $t)
		{
			for ($i = 0, $limit = $this->randomCommentsCount(); $i < $limit; $i++)
			{
				$c = new Comment();
				$c->setContent($this->randomPostContent());
				if ($f->boolean(9)) // Thread author's comment
					$c->setAuthor($t->getAuthor());
				else
					$c->setAuthor($f->randomElement($this->entities[$usersKey]));
				$c->setThread($t);
				
				$this->entities[$commentsKey][] = $c;
				$this->em->persist($c);
			}
			$t->setCommentsCount($limit);
			$totalCount += $limit;
		}
		
		return $totalCount;
	}
	
	public function loadVotes(array $args)
	{
		$f = $this->faker;
		$postsKey = $args['postsKey'];
		$usersKey = $args['usersKey'];
		$votesKey = $args['votesKey'];
		$isThreads = $args['isThreads']; // Thread or comment votes generation?
		
		$totalCount = 0; // Newly created votes
		$postsCount = count($this->entities[$postsKey]); // Posts to process
		$totalTime = microtime(true);
		
		// Breakpoints system for huge amounts of objects
		// After every breakpoint flushes db, prints progress report
		$breakpoints = $args['breakpoints']; // Number of breakpoints
		$itemsPerBreakpoint = $postsCount / $breakpoints;
		$nextBreakpoint = 0;
		$breakpointStartTime = microtime(true);
		
		for ($i = 0; $i < $postsCount; $i++)
		{
			$p = $this->entities[$postsKey][$i];
			
			$voteChance = $f->numberBetween(20, 92); // Chance for each user to vote on this post
			$upvoteChance = $f->numberBetween(30, 90); // Chance for each vote to be upvote
			
			$postTotalVotes = 0; // Total votes sum change for this post
			
			foreach ($this->entities[$usersKey] as $u)
			{
				if ($p->getAuthor() === $u)
					continue; // Prevent authors voting on their own threads
				
				if ($f->boolean($voteChance))
				{
					$voteValue = $f->boolean($upvoteChance) ? 1 : -1;
					$vote = $isThreads ?
						VoteThread::create($p, $u, $voteValue) :
						VoteComment::create($p, $u, $voteValue);
					//$this->entities[$votesKey][] = $vote; // Don't save vote objects to improve performance
					$postTotalVotes += $voteValue;
					$totalCount++;
					
					$this->em->persist($vote);
				}
				
			}
			
			$p->setVotesCount($p->getVotesCount() + $postTotalVotes);
			
			// Optimisation system
			if ($i > $nextBreakpoint)
			{
				$this->em->flush();
				
				// Clear flushed posts
				for ($j = 0; $j < $i; $j++)
				{
					// TODO make not crash, improve votes fixtures performance
					//$this->em->detach($this->entities[$postsKey][$j]); // Crashes
					$this->entities[$postsKey][$j] = null;
				}
				
				//$this->em->clear(); // Crashes
				
				$nextBreakpoint += $itemsPerBreakpoint;
				$breakpointEndTime = microtime(true);
				
				$this->log(sprintf(
					'    %s votes @ %d%% in %.2f s (total %.2f s), done %d/%d posts, loaded %s votes',
					$isThreads ? 'Thread' : 'Comment',
					($i / $postsCount) * 100,
					$breakpointEndTime - $breakpointStartTime,
					$breakpointEndTime - $totalTime,
					$i,
					$postsCount,
					number_format($totalCount, 0, '.', ' ')
				));
				
				$breakpointStartTime = microtime(true);
			}
		}
		
		return $totalCount;
	}
	
	function randomPostContent()
	{
		$r = $this->faker->randomFloat(null, 0.0, 100.0);
		$length = -1;
		
		/* // V1
		switch (true) // Probability to text length
		{
			case $r < 9: // 9%
				$length = 30; // ~5 words
				break;
			case $r < 23: // 14%
				$length = 60; // ~10 words
				break;
			case $r < 43: // 20%
				$length = 120; // ~20 words
				break;
			case $r < 63: // 20%
				$length = 180; // ~30 words
				break;
			case $r < 78: // 15%
				$length = 242; // ~40 words
				break;
			case $r < 88: // 10%
				$length = 302; // ~50 words
				break;
			case $r < 92: // 4%
				$length = 360; // ~60 words
				break;
			case $r < 95: // 3%
				$length = 420; // ~70 words
				break;
			case $r < 97: // 2%
				$length = 482; // ~80 words
				break;
			case $r < 99: // 2%
				$length = 541; // ~90 words
				break;
			default:
			//case $r < 100: // 1%
				$length = 604; // ~100 words
				break;
		}*/
		
		// V2
		switch (true) // Probability to text length
		{
			case $r < 12: // 12%
				$length = 30; // ~5 words
				break;
			case $r < 29: // 17%
				$length = 60; // ~10 words
				break;
			case $r < 43: // 14%
				$length = 120; // ~20 words
				break;
			case $r < 63: // 20%
				$length = 180; // ~30 words
				break;
			case $r < 75: // 12%
				$length = 242; // ~40 words
				break;
			case $r < 85: // 10%
				$length = 302; // ~50 words
				break;
			case $r < 90: // 5%
				$length = 360; // ~60 words
				break;
			case $r < 93: // 3%
				$length = 420; // ~70 words
				break;
			case $r < 96: // 3%
				$length = 482; // ~80 words
				break;
			case $r < 98.5: // 2.5%
				$length = 541; // ~90 words
				break;
			default:
				//case $r < 100: // 1.5%
				$length = 604; // ~100 words
				break;
		}
		
		return $this->faker->realText($length);
	}
	
	function randomCommentsCount()
	{
		$f = $this->faker;
		$r = $f->randomFloat(null, 0.0, 100.0);
		
		/* // V1
		switch (true)
		{
			case $r < 15: // 15%
				return $f->numberBetween(5, 10);
			case $r < 30: // 15%
				return $f->numberBetween(10, 20);
			case $r < 70: // 40%
				return $f->numberBetween(20, 35);
			case $r < 85: // 15%
				return $f->numberBetween(30, 40);
			case $r < 95: // 10%
				return $f->numberBetween(40, 50);
			default:
			//case $r < 100: // 5%
				return $f->numberBetween(50, 120);
		}*/
		
		// V2
		switch (true)
		{
			case $r < 9: // 9%
				return 0;
			case $r < 23: // 14%
				return $f->numberBetween(1, 10);
			case $r < 37: // 14%
				return $f->numberBetween(10, 20);
			case $r < 75: // 38%
				return $f->numberBetween(20, 35);
			case $r < 88: // 13%
				return $f->numberBetween(30, 40);
			case $r < 95: // 7%
				return $f->numberBetween(40, 50);
			default:
				//case $r < 100: // 5%
				return $f->numberBetween(50, 120);
		}
	}
	
}
