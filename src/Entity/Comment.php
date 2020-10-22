<?php

namespace App\Entity;

use App\Repository\CommentRepository;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=CommentRepository::class)
 * @ORM\Table(indexes={@ORM\Index(columns={"content"}, flags={"fulltext"})})
 */
class Comment
{ 
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
	 * @Groups({"comment_read"})
     */
    private $id;

    /**
     * @ORM\Column(type="text")
	 * @Assert\NotBlank()
	 * @Assert\Length(
	 *     min=1,
	 *     max=30000,
	 *     allowEmptyString=false
	 * )
	 * @Groups({"comment_read", "comment_write"})
     */
    private $content;

    /**
	 * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime")
	 * @Groups({"comment_read"})
     */
    private $createdAt;
	
	/**
	 * @Gedmo\Timestampable(on="update")
	 * @ORM\Column(type="datetime")
	 * @Groups({"comment_read"})
	 */
	private $updatedAt;
	
	/**
	 * @ORM\Column(type="boolean")
	 * @Groups({"comment_read"})
	 */
	private $edited = false;
	
    /**
     * @ORM\ManyToOne(targetEntity=Thread::class, inversedBy="comments")
     * @ORM\JoinColumn(nullable=false)
	 * @Groups({"thread_read"})
     */
    private $thread;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="comments", fetch="EAGER")
     * @ORM\JoinColumn(nullable=false)
	 * @Groups({"user_read"})
     */
    private $author;
	
	/**
	 * Vote on this item of currently logged in user.
	 * Not stored in DB, instead joined from VoteComment results.
	 * @Groups({"comment_read"})
	 */
	private $userVote = 0;

    /**
	 * TODO change to votesSum
     * @ORM\Column(type="integer")
	 * @Groups({"comment_read"})
     */
    private $votesCount = 0;
    

    public function __construct()
	{
	}
	
	public function getId(): ?int
	{
		return $this->id;
	}

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = trim($content);

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }
	
	public function getUpdatedAt(): ?\DateTimeInterface
	{
		return $this->updatedAt;
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

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): self
    {
        $this->author = $author;

        return $this;
    }
	
	public function setUserVote(int $userVote): self
	{
		$this->userVote = $userVote;
		
		return $this;
	}
	
	public function getUserVote(): int
	{
		return $this->userVote;
	}

    public function getEdited(): ?bool
    {
        return $this->edited;
    }

    public function setEdited(bool $edited): self
    {
        $this->edited = $edited;

        return $this;
    }

    public function getVotesCount(): ?int
    {
        return $this->votesCount;
    }

    public function setVotesCount(int $votesCount): self
    {
        $this->votesCount = $votesCount;

        return $this;
    }
}
