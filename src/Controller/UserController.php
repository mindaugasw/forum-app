<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\EntitiesCRUD\UserCRUD;
use Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;


/**
 * @Route("/api/users")
 */
class UserController extends BaseController
{
	private UserCRUD $userCRUD;
	
	public function __construct(UserCRUD $userCRUD)
	{
		parent::__construct();
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
     * Login is handled by JWT auth, at path /api/login_check
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
     * @Route("/logout", methods={"POST"})
     */
    public function logout(Request $request)
    {
		if ($request->cookies->has('refresh_token') === true)
		{
			$refreshToken = $this->em->getRepository(RefreshToken::class)->findOneBy(
				['refreshToken' => $request->cookies->get('refresh_token')]);
			
			if ($refreshToken !== null)
			{
				$this->em->remove($refreshToken);
				$this->em->flush();
			}
		}
		
    	$response = $this->responses->ApiResponse(null, 200);
    	$response->headers->clearCookie('refresh_token');
    	return $response;
    }
}
