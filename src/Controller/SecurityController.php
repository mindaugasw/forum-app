<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Serializer\SerializerInterface;

class SecurityController extends BaseController
{
	
	private UserRepository $userRepo;
	
	public function __construct(SerializerInterface $serializer, EntityManagerInterface $em, JsonValidator $validator, QueryParamsValidator $queryValidator)
	{
		parent::__construct($serializer, $em, $validator, $queryValidator);
		
		$this->userRepo = $em->getRepository(User::class);
	}
	
	
	// Login route (/api/login_check) is handled by JWT bundle
		
	/**
	 * @Route("/api/register", methods={"POST"})
	 */
	public function register(Request $request, UserPasswordEncoderInterface $passwordEncoder)
	{
		/** @var User $newUser */
		$newUser = $this->jsonValidator->ValidateNew($request->getContent(), User::class, ['user_write']);
		$newUser->setRoles([User::ROLE_USER]);
		$newUser->setPassword($passwordEncoder->encodePassword($newUser, $newUser->getPassword()));
		
		dd($newUser);
		
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
