<?php

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\User;

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
    	$usr = $this->getUser();
    	if ($usr === null)
    		return $this->ApiResponse('NULL USER', 299);
    	else
    		return $this->ApiResponse($usr, 299, ['user_read']);
    }
	
	/**
	 * @Route("/user", methods={"POST"})
	 * @IsGranted(User::ROLE_USER)
	 */
	public function testUser()
	{
		return $this->ApiResponse($this->getUser(), 298, ['user_read']);
	}
	
	/**
	 * @Route("/admin", methods={"POST"})
	 * @IsGranted(User::ROLE_ADMIN)
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
