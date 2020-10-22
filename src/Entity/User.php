<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 */
class User implements UserInterface
{
	const ROLE_USER = 'ROLE_USER';
	const ROLE_ADMIN = 'ROLE_ADMIN';
	
	/**
	 * Serializer groups:
	 * user_read
	 * user_create - new user creation, only by user himself
	 * user_edit_himself - edit user info, by himself
	 * user_edit_admin - edit user info, by admin
	 */
	
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
	 * @Groups({"user_read"})
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
	 * @Groups({"user_read", "user_create"})
	 * @Assert\Length(
	 *     min=4,
	 *     max=25,
	 *     allowEmptyString=false
	 * )
     */
    private $username;

    /**
     * @ORM\Column(type="json")
	 * @Groups({"user_read", "user_edit_admin"})
     */
    private $roles = [];

    /**
     * @var string The hashed password
     * @ORM\Column(type="string")
	 * @Groups({"user_create", "user_edit_himself"})
     */
    private $password;
	
	/**
	 * @var string Currently set plaintext password. Used only when deserializing edited user.
	 * @Groups({"user_edit_himself"})
	 */
    private $oldPassword;

    /**
     * @ORM\OneToMany(targetEntity=Thread::class, mappedBy="author", cascade={"remove"})
	 * @Groups({"thread_read"})
     */
    private $threads;

    /**
     * @ORM\OneToMany(targetEntity=Comment::class, mappedBy="author", cascade={"remove"})
	 * @Groups({"comment_read"})
     */
    private $comments;

    public function __construct()
    {
        $this->threads = new ArrayCollection();
        $this->comments = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return (string) $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = self::ROLE_USER;

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
    	$pos = array_search(self::ROLE_USER, $roles);
    	if ($pos !== false)
    		unset($roles[$pos]); // Do not store the default role in DB
		
        $this->roles = array_values($roles); // array_values needed as unset() above does not update indices

        return $this;
    }
	
	/**
	 * Returns array of all possible user roles
	 */
    public static function getAllPossibleRoles()
	{
		return [self::ROLE_USER, self::ROLE_ADMIN];
	}

    /**
     * @see UserInterface
     */
    public function getPassword(): string
    {
        return (string) $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }
	
	/**
	 * Get old password form input (plaintext)
	 * @return string
	 */
    public function getOldPassword(): string
    {
        return (string) $this->oldPassword;
    }

    public function setOldPassword(string $oldPassword): self
    {
        $this->oldPassword = $oldPassword;

        return $this;
    }
	
    /**
     * @see UserInterface
     */
    public function getSalt()
    {
        // not needed when using the "bcrypt" algorithm in security.yaml
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    /**
     * @return Collection|Thread[]
     */
    public function getThreads(): Collection
    {
        return $this->threads;
    }

    public function addThread(Thread $thread): self
    {
        if (!$this->threads->contains($thread)) {
            $this->threads[] = $thread;
            $thread->setAuthor($this);
        }

        return $this;
    }

    public function removeThread(Thread $thread): self
    {
        if ($this->threads->contains($thread)) {
            $this->threads->removeElement($thread);
            // set the owning side to null (unless already changed)
            if ($thread->getAuthor() === $this) {
                $thread->setAuthor(null);
            }
        }

        return $this;
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
            $comment->setAuthor($this);
        }

        return $this;
    }

    public function removeComment(Comment $comment): self
    {
        if ($this->comments->contains($comment)) {
            $this->comments->removeElement($comment);
            // set the owning side to null (unless already changed)
            if ($comment->getAuthor() === $this) {
                $comment->setAuthor(null);
            }
        }

        return $this;
    }
}
