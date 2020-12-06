<?php


namespace App\Service\EntitiesCRUD;

use App\Entity\User;
use App\Exception\ApiBadRequestException;
use App\Repository\UserRepository;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Security;
use ZxcvbnPhp\Zxcvbn;

/**
 * Provides methods for more complex User CRUD operations.
 * NOTE: does NOT save changes to DB on its own!
 */
class UserCRUD
{
	private string $app_env;
	private EntityManagerInterface $em;
	private QueryParamsValidator $queryValidator;
	private JsonValidator $jsonValidator;
	private UserPasswordEncoderInterface $passwordEncoder;
	private Security $security;
	
	private UserRepository $userRepo;
	
	public function __construct(
		string $app_env,
		EntityManagerInterface $em,
		QueryParamsValidator $queryValidator,
		JsonValidator $jsonValidator,
		UserPasswordEncoderInterface $passwordEncoder,
		Security $security)
	{
		$this->app_env = $app_env;
		$this->em = $em;
		$this->queryValidator = $queryValidator;
		$this->jsonValidator = $jsonValidator;
		$this->passwordEncoder = $passwordEncoder;
		$this->security = $security;
		
		$this->userRepo = $em->getRepository(User::class);
	}
	
	/**
	 * Checks $request for these query params:
	 * orderby, orderdir, page, perpage
	 * 
	 * @param Request $request
	 * @return User[]|\Knp\Component\Pager\Pagination\PaginationInterface
	 */
	public function getList(Request $request)
	{
		$params = $this->queryValidator->Everything($request, User::class, null, ['password', 'threads', 'comments']);
		
		return $this->userRepo->findByPaginated([], $params['ordering'], $params['pagination']);
	}
	
	public function createNew(Request $request)
	{
		$newUser = $this->jsonValidator->ValidateNew($request->getContent(), User::class, ['user_create']);
		
		if ($this->userRepo->findOneBy(['username' => $newUser->getUsername()]) !== null)
			throw new ApiBadRequestException("This username is already in use: ".$newUser->getUsername());
		
		$newUser->setRoles([User::ROLE_USER]);
		
		$this->ensureSafePassword($newUser->getPassword());
		$newUser->setPassword($this->passwordEncoder->encodePassword($newUser, $newUser->getPassword()));
		
		return $newUser;
	}
	
	public function edit(User $user, Request $request)
	{
		$editAllowed = false;
		
		if ($this->security->isGranted('MANAGE_HIMSELF', $user))
		{
			$editAllowed = true;
			$this->editByUserHimself($user, $request);
		}
		
		if ($this->security->isGranted('MANAGE_AS_ADMIN', $user))
		{
			$editAllowed = true;
			$this->editAsAdmin($user, $request);
		}
		
		if (!$editAllowed)
			throw new UnauthorizedHttpException('');
		
		return $user;
	}
	
	/**
	 * Allows user to edit only his password.
	 */
	private function editByUserHimself(User $user, Request $request)
	{
		$oldPasswordHash = $user->getPassword();
		$this->jsonValidator->ValidateEdit($request->getContent(), $user, ['user_edit_himself']);
		$newPasswordPlaintext = $user->getPassword(); // Returns newly deserialized plaintext password OR old password hash (if new password was not set)
		
		if ($oldPasswordHash !== $newPasswordPlaintext) // Password was changed
		{
			$oldPasswordPlaintext = $user->getOldPassword();
			
			$user->setPassword($oldPasswordHash); // Temporarily set back to old password (as it is overwritten by deserializer). Needed for isPasswordValid method
			
			if (!$this->passwordEncoder->isPasswordValid($user, $oldPasswordPlaintext))
			{
				throw new ApiBadRequestException('Password does not match currently set password.');
			}
			
			$this->ensureSafePassword($newPasswordPlaintext);
			$user->setPassword($this->passwordEncoder->encodePassword($user, $newPasswordPlaintext));
		}
		
		return $user;
	}
	
	/**
	 * Allows admin to edit only user's roles.
	 */
	private function editAsAdmin(User $user, Request $request)
	{
		$this->jsonValidator->ValidateEdit($request->getContent(), $user, ['user_edit_admin']);
		$this->ensureValidRoles($user->getRoles());
		
		return $user;
	}
	
	/**
	 * Ensures that password is at least of level 2 by zxcvbn.
	 * If not, throws an exception, including the suggestion to improve password.
	 * Allows any password on dev.
	 */
	private function ensureSafePassword(string $plainPassword): bool
	{
		$zxcvbn = new Zxcvbn();
		$passwordData = $zxcvbn->passwordStrength($plainPassword);
		
		if ($passwordData['score'] < 2 && $this->app_env !== 'dev')
		{
			$errorText = "Password is too weak. {$passwordData['feedback']['warning']}.";
			throw new ApiBadRequestException($errorText);
		}
		
		return true;
	}
	
	/**
	 * Ensures that password all roles are valid.
	 * If not, throws an exception.
	 */
	private function ensureValidRoles(array $roles): bool
	{
		$validRoles = User::getAllPossibleRoles();
		
		foreach ($roles as $role)
		{
			if (!in_array($role, $validRoles))
				throw new ApiBadRequestException('Unknown user role: '.$role);
		}
		
		return true;
	}
}