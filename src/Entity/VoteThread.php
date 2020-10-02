<?php

namespace App\Entity;

use App\Repository\VoteThreadRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=VoteThreadRepository::class)
 */
class VoteThread
{
    /**
	 * @ORM\Id
     * @ORM\ManyToOne(targetEntity=Thread::class)
     */
    private $thread;

    /**
	 * @ORM\Id
     * @ORM\ManyToOne(targetEntity=User::class)
     */
    private $user;

    /**
     * @ORM\Column(type="smallint")
     */
    private $vote = 0;
	
	public function __construct() {	}
	
	public static function create(Thread $thread, User $user, int $vote) : self
	{
		return (new VoteThread())
			->setThread($thread)
			->setUser($user)
			->setVote($vote);
	}
	
	/**
	 * Sets $vote value on $thread
	 * Shortcut for: $this->$getThread()->setUserVote($this->getVote());
	 */
	public function setUserVoteOnThread(): self
	{
		$this->getThread()->setUserVote($this->getVote());
		
		return $this;
	}
	
	public function getThread(): ?Thread
	{
		return $this->thread;
	}

    public function setThread(?Thread $thread): self
    {
        $this->thread = $thread;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getVote(): ?int
    {
        return $this->vote;
    }

    public function setVote(int $vote): self
    {
    	if ($vote === 1 || $vote === 0 || $vote === -1) {
			$this->vote = $vote;
			return $this;
		} else
			throw new \InvalidArgumentException('Invalid vote value: '.$vote);	
	}
}
