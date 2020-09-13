<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiSubresource;
use App\Repository\ThreadRepository;
use Carbon\Carbon;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ApiResource(
 *     collectionOperations={"get", "post"},
 *     itemOperations={"get", "put", "delete"},
 *     normalizationContext={"groups"={"thread_read"}},
 *     denormalizationContext={"groups"={"thread_write"}}
 * )
 * @ORM\Entity(repositoryClass=ThreadRepository::class)
 */
class Thread
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
	 * @Assert\NotBlank()
	 * @Groups({"thread_read", "thread_write"})
     */
    private $title;

    /**
     * @ORM\Column(type="text", nullable=true)
	 * @Groups({"thread_read", "thread_write"})
     */
    private $content;

    /**
     * @ORM\Column(type="datetime")
	 * @Groups({"thread_read"})
     */
    private $createdAt;

    /**
     * @ORM\OneToMany(targetEntity=Comment::class, mappedBy="thread", orphanRemoval=true)
	 * @Groups({"thread_read"})
	 * @ApiSubresource()
     */
    private $comments;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="threads")
     * @ORM\JoinColumn(nullable=false)
	 * @Groups({"thread_read"})
     */
    private $author;

    public function __construct()
    {
        $this->comments = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
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
        $this->title = $title;

        return $this;
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

    /*public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }*/
	
	public function getCreatedAtAgo() : string
	{
		return Carbon::instance($this->getCreatedAt())->diffForHumans();
	}

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
