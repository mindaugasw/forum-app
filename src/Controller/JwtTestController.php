<?php

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/jwt")
 */
class JwtTestController extends BaseController
{
    /**
     * @Route("/none", methods={"POST"})
     */
    public function testNone()
    {
    	
    	return $this->ApiResponse('NO AUTH', 299);
    }
	
	/**
	 * @Route("/user", methods={"POST"})
	 * @IsGranted("ROLE_USER")
	 */
	public function testUser()
	{
		
		return $this->ApiResponse($this->getUser(), 298, ['user_read']);
	}
	
	/**
	 * @Route("/admin", methods={"POST"})
	 * @IsGranted("ROLE_ADMIN")
	 */
	public function testAdmin()
	{
		
		return $this->ApiResponse($this->getUser(), 297, ['user_read']);
	}
	
	/**
	 * @Route("/wtf", methods={"POST"})
	 * @IsGranted("ROLE_WTF")
	 */
	public function testWtf()
	{
		
		return $this->ApiResponse($this->getUser(), 296, ['user_read']);
	}
}
