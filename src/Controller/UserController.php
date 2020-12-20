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
class UserController extends BaseApiController
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
	 * Can return:
	 * 		200
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
	 * Can return:
	 * 		200
	 * 		404 if user not found
	 * 
	 * @Route("/{user}/", methods={"GET"})
	 */
	public function getOne(User $user)
	{
		return $this->ApiResponse($user, 200, ['user_read']);
	}
	
	/**
	 * Can return:
	 * 		200
	 * 		400 if username already taken, invalid body, password too weak
	 * 
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
	 * User edit. Allows editing roles (for admin), password (for user himself).
	 * Can return: 
	 * 		200
	 * 		400 if old password wrong, new password too weak, invalid body
	 * 		401 if invalid JWT or unauthorized (editing not yourself and are not admin)
	 * 		404 if user not found
	 * 
	 * @Route("/{user}/", methods={"PATCH"})
	 * @IsGranted(User::ROLE_USER)
	 */
	public function edit(User $user, Request $request)
	{
		$this->userCRUD->edit($user, $request);
		//return $this->responses->ErrorResponse('$type', 400, 'msg', 'detail');
		$this->em->flush();
		
		return $this->ApiResponse($user, 200, ['user_read']);
	}
	
	/**
	 * Can return:
	 * 		204
	 * 		401 if deleting not yourself and are not admin
	 * 		404 if user not found
	 * 
	 * @Route("/{user}/", methods={"DELETE"})
	 * @IsGranted("MANAGE", subject="user")
	 */
	public function delete(User $user)
	{
		$this->em->remove($user);
		$this->em->flush();
		return $this->ApiResponse(null, 204);
	}
}
