<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Core\Annotation\ApiResource;
use App\Repository\CommentRepository;
use Carbon\Carbon;
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
     * @ORM\ManyToOne(targetEntity=Thread::class, inversedBy="comments")
     * @ORM\JoinColumn(nullable=false)
     */
    private $thread;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="comments") // TODO fetch="EAGER"
     * @ORM\JoinColumn(nullable=false)
	 * @Groups({"user_read"})
     */
    private $author;
	
	/**
	 * Vote on this item of currently logged in user.
	 * Not stored in DB, instead joined in repository from VoteThread results.
	 * @Groups({"comment_read"})
	 */
	private $userVote = 0;
    

    public function __construct()
	{
		$this->createdAt = new \DateTimeImmutable();
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
        $this->content = $content;

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
	
	/*public function getCreatedAtAgo() : string
	{
		// TODO
		return Carbon::instance($this->getCreatedAt())->diffForHumans();
	}*/

    /*public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }*/
	
	/*public function getCreatedAtAgo() : string
	{
		return Carbon::instance($this->getCreatedAt())->diffForHumans();
	}*/

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
}
