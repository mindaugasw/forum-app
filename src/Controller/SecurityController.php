<?php

namespace App\Controller;

use Gesdinet\JWTRefreshTokenBundle\Entity\RefreshToken;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SecurityController extends BaseApiController
{
	public function __construct()
	{
		parent::__construct();
	}
	
	// Login and Logout routes are handled by JWT bundle, Registration handled by UserController
	
	/**
	 * @Route("/api/logout", methods={"POST"})
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
