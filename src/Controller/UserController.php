<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\UserCRUD;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Serializer\SerializerInterface;


/**
 * @Route("/api/users")
 */
class UserController extends BaseController
{
	
	//private UserRepository $userRepo;
	private UserCRUD $userCRUD;
	
	public function __construct(SerializerInterface $serializer, EntityManagerInterface $em, JsonValidator $validator, QueryParamsValidator $queryValidator, UserCRUD $userCRUD)
	{
		parent::__construct($serializer, $em, $validator, $queryValidator);
		
		//$this->userRepo = $em->getRepository(User::class);
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
	
	
	
	
	
	
	// Login route (/api/login_check) is handled by JWT bundle
		
	/**
	 * @Route("/register/", methods={"POST"})
	 */
	public function register(Request $request, UserPasswordEncoderInterface $passwordEncoder)
	{
		$this->userCRUD->register($request);
		dd('x');
		
		
		/** @var User $newUser */
		/*$newUser = $this->jsonValidator->ValidateNew($request->getContent(), User::class, ['user_write']);
		
		if ($this->userRepo->findOneBy(['username' => $newUser->getUsername()]) !== null)
			throw new BadRequestException("This username is already in use: ".$newUser->getUsername());
		
		$newUser->setRoles([User::ROLE_USER]);
		$newUser->setPassword($passwordEncoder->encodePassword($newUser, $newUser->getPassword()));
		
		$this->em->persist($newUser);
		$this->em->flush();
		
		return $this->ApiResponse($newUser, 201, ['user_read']);*/
	}
	
	
    /*
     * @Route("/login", name="app_login")
     */
    /*public function login(AuthenticationUtils $authenticationUtils): Response
    {
    	// TODO remove
        // if ($this->getUser()) {
        //     return $this->redirectToRoute('target_path');
        // }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }*/

    /*
     * @Route("/logout", name="app_logout")
     */
    /*public function logout()
    {
    	// TODO: implement. Remove refresh token cookie
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }*/
}
