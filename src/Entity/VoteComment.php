<?php

namespace App\Entity;

use App\Repository\VoteCommentRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=VoteCommentRepository::class)
 */
class VoteComment
{
    /**
	 * @ORM\Id
     * @ORM\ManyToOne(targetEntity=Comment::class)
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private $comment;

    /**
	 * @ORM\Id
     * @ORM\ManyToOne(targetEntity=User::class)
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private $user;

    /**
     * @ORM\Column(type="smallint")
     */
    private $vote;

    public function __construct() { }
	
	public static function create(Comment $comment, User $user, int $vote) : self
	{
		return (new VoteComment())
			->setComment($comment)
			->setUser($user)
			->setVote($vote);
	}
    
	/**
	 * Sets $vote value on $comment
	 * Shortcut for: $this->$getComment()->setUserVote($this->getVote());
	 */
	public function setUserVoteOnComment(): self
	{
		$this->getComment()->setUserVote($this->getVote());
		
		return $this;
	}
	
	public function getComment(): ?Comment
    {
        return $this->comment;
    }

    public function setComment(?Comment $comment): self
    {
        $this->comment = $comment;

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
