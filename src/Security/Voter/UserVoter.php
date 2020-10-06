<?php

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\User\UserInterface;

class UserVoter extends Voter
{
	private Security $security;
	
	public function __construct(Security $security)
	{
		$this->security = $security;
	}
	
    protected function supports($attribute, $subject)
    {
        // replace with your own logic
        // https://symfony.com/doc/current/security/voters.html
        return in_array($attribute, ['MANAGE', 'MANAGE_HIMSELF', 'MANAGE_AS_ADMIN'])
            && $subject instanceof User;
    }

    protected function voteOnAttribute($attribute, $subject, TokenInterface $token)
    {
    	/** @var User $subject */
    	
        $user = $token->getUser();
        // if the user is anonymous, do not grant access
        if (!$user instanceof UserInterface) {
            return false;
        }

        // ... (check conditions and return true to grant permission) ...
        switch ($attribute) {
			case 'MANAGE':
				if ($subject === $user)
					return true;
				
				if ($this->security->isGranted(User::ROLE_ADMIN))
					return true;
				return false;
				
            case 'MANAGE_HIMSELF': // User edits his own info
                if ($subject === $user)
                	return true;
                return false;
                
			case 'MANAGE_AS_ADMIN': // Admin edits someone's else info
				if ($this->security->isGranted(User::ROLE_ADMIN))
					return true;
				return false;
        }

        return false;
    }
}
