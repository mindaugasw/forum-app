<?php


namespace App\Service;


use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class UserCRUD
{
	private EntityManagerInterface $em;
	private QueryParamsValidator $queryValidator;
	
	private UserRepository $userRepo;
	/**
	 * Services container
	 */
	private $container;
	
	public function __construct(EntityManagerInterface $em, QueryParamsValidator $queryValidator, ContainerInterface $container)
	{
		$this->em = $em;
		$this->queryValidator = $queryValidator;
		
		$this->userRepo = $em->getRepository(User::class);
		$this->container = $container;
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
	
	public function register(Request $request)
	{
		$passwordEncoder = $this->container->get(UserPasswordEncoderInterface::class);
		
		dd($passwordEncoder);
	}
}