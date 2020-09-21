<?php

namespace App\Entity;

use App\Repository\VoteThreadRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=VoteThreadRepository::class)
 */
class VoteThread
{
    /*
     * ORM\Id
     * ORM\GeneratedValue
     * ORM\Column(type="integer")
     */
    //private $id;

    /**
	 * @ORM\Id
     * @ORM\ManyToOne(targetEntity=Thread::class)
     * ORM\JoinColumn(nullable=false)
     */
    private $thread;

    /**
	 * @ORM\Id
     * @ORM\ManyToOne(targetEntity=User::class)
     * ORM\JoinColumn(nullable=false)
     */
    private $user;

    /**
     * @ORM\Column(type="boolean")
     */
    private $upvote = true;

    /*public function getId(): ?int
    {
        return $this->id;
    }*/
	
	public function __construct()
	{
	}
	public static function create(Thread $thread, User $user, bool $upvote) : self
	{
		return (new VoteThread())
			->setThread($thread)
			->setUser($user)
			->setUpvote($upvote);
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

    public function isUpvote(): ?bool
    {
        return $this->upvote;
    }

    public function setUpvote(bool $upvote): self
    {
        $this->upvote = $upvote;

        return $this;
    }
}
