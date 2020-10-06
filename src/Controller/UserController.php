<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\UserCRUD;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Serializer\SerializerInterface;


/**
 * @Route("/api/users")
 */
class UserController extends BaseController
{
	private UserCRUD $userCRUD;
	
	public function __construct(SerializerInterface $serializer, EntityManagerInterface $em, JsonValidator $validator, QueryParamsValidator $queryValidator, UserCRUD $userCRUD)
	{
		parent::__construct($serializer, $em, $validator, $queryValidator);
		
		$this->userCRUD = $userCRUD;
	}
	
	/**
	 * Get a list of users.
	 * Allows items ordering and pagination, using query params.
	 * Supported query params: orderby, orderdir, page, perpage.
	 * Defaults to 1st page with 20 items, and no ordering.
	 * More info in QueryParamsValidator.
	 *
	 * @Route("/", methods={"GET"})
	 */
	public function getList(Request $request)
	{
		$data = $this->userCRUD->getList($request);
		
		return $this->ApiPaginatedResponse(
			$data, 200, ['thread_read', 'user_read'], ['threads']
		);
	}
	
	/**
	 * @Route("/{user}/", methods={"GET"})
	 */
	public function getOne(User $user)
	{
		return $this->ApiResponse($user, 200, ['user_read']);
	}
	
	/**
	 * @Route("/register/", methods={"POST"})
	 */
	public function register(Request $request)
	{
		$newUser = $this->userCRUD->createNew($request);
		$this->em->persist($newUser);
		$this->em->flush();
		
		return $this->ApiResponse($newUser, 201, ['user_read']);
	}
	
	/**
	 * Edit that is called by the user himself (instead of admin).
	 * Allows changing password, does not allow changing roles.
	 * 
	 * @Route("/{user}/", methods={"PATCH"})
	 * @IsGranted(User::ROLE_USER)
	 */
	public function edit(User $user, Request $request)
	{
		// TODO test role change
		
		$this->userCRUD->edit($user, $request);
		
		$this->em->flush();
		
		return $this->ApiResponse($user, 200, ['user_read']);
	}
	
	/**
	 * @Route("/{user}/", methods={"DELETE"})
	 * @IsGranted("MANAGE", subject="user")
	 */
	public function delete(User $user)
	{
		$this->em->remove($user);
		$this->em->flush();
		return $this->ApiResponse(null, 204);
		
		// TODO: should user threads and comments also be deleted on user delete?
	}
	
	
    /*
     * Login is not handled by JWT auth, at path /api/login_check
     * 
     * Route("/login", name="app_login")
     *
    /*public function login(AuthenticationUtils $authenticationUtils): Response
    {
    	throw new Exception('Login should be handled by JWT auth.');
    	if ($this->getUser()) {
            return $this->redirectToRoute('target_path');
        }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }*/

    /**
     * @Route("/logout")
     */
    public function logout()
    {
    	// TODO: implement. Remove refresh token cookie
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
