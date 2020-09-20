<?php

namespace App\Entity;


use App\Repository\ThreadRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo; // TODO replace with original repo
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=ThreadRepository::class)
 */
class Thread
{
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
	// TODO fix to NOT automatically set on new creation. Or set to not nullable
	private $updatedAt;

    /**
     * @ORM\OneToMany(targetEntity=Comment::class, mappedBy="thread", orphanRemoval=true)
	 * Groups({"thread_read"})
     */
    private $comments;

    //private $commentCount; // TODO
    
    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="threads")
     * @ORM\JoinColumn(nullable=false)
	 * @Groups({"user_read"})
     */
    private $author;

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

    /*public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }*/
	
	public function getUpdatedAt(): ?\DateTimeInterface
	{
		return $this->updatedAt;
	}
	
	/*public function setUpdatedAt(?\DateTimeInterface $updatedAt): self
	{
		$this->updatedAt = $updatedAt;
		
		return $this;
	}*/
	
	
	/*public function getCreatedAtAgo() : string
	{
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
}
