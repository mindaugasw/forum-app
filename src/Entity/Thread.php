<?php

namespace App\Entity;


use App\Repository\ThreadRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // TODO replace with original repo
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=ThreadRepository::class)
 */
class Thread
{
	// TODO add sluggable
	
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
	 * @Groups({"thread_read"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
	 * @Assert\NotBlank()
	 * @Assert\Length(
	 *     min=10,
	 *     max=255,
	 *     allowEmptyString=false
	 * )
	 * @Groups({"thread_read", "thread_write"})
     */
    private $title;

    /**
     * @ORM\Column(type="text", nullable=true)
	 * @Assert\NotBlank()
	 * @Assert\Length(
	 *     min=1,
	 *     max=30000,
	 *     allowEmptyString=false
	 * )
	 * @Groups({"thread_read", "thread_write"})
     */
    private $content;

    /**
	 * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime")
	 * @Groups({"thread_read"})
     */
    private $createdAt;
	
	/**
	 * @Gedmo\Timestampable(on="update")
	 * @ORM\Column(type="datetime", nullable=true)
	 * @Groups({"thread_read"})
	 */
	private $updatedAt; // TODO fix to NOT automatically set on new creation. Or set to not nullable

	// private $lastCommentAt; // TODO
	
    /**
     * @ORM\OneToMany(targetEntity=Comment::class, mappedBy="thread", orphanRemoval=true) // TODO EXTRA_LAZY ?
	 * Groups({"thread_read"})
	 * ORM\OrderBy({"createdAt"="ASC"}) // TODO
     */
    private $comments;

    //private $commentCount; // TODO
    
    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="threads") // TODO EAGER load
     * @ORM\JoinColumn(nullable=false)
	 * @Groups({"user_read"})
     */
    private $author;
	
	/**
	 * Vote on this item of currently logged in user.
	 * Not stored in DB, joined in repository from VoteThread results.
	 * @Groups({"user_read"})
	 */
    private $userVote = 0;
    
	public function __construct()
    {
        $this->comments = new ArrayCollection();
	}

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = trim($title);

        return $this;
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
	
	/*public function getCreatedAtAgo() : string
	{
		// TODO
		return Carbon::instance($this->getCreatedAt())->diffForHumans();
	}*/

    /**
     * @return Collection|Comment[]
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comment $comment): self
    {
        if (!$this->comments->contains($comment)) {
            $this->comments[] = $comment;
            $comment->setThread($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): self
    {
        if ($this->comments->contains($comment)) {
            $this->comments->removeElement($comment);
            // set the owning side to null (unless already changed)
            if ($comment->getThread() === $this) {
                $comment->setThread(null);
            }
        }

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
