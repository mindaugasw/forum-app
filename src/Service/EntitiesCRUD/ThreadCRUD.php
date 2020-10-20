<?php


namespace App\Service\EntitiesCRUD;


use App\Entity\Thread;
use App\Repository\ThreadRepository;
use App\Service\Validator\JsonValidator;
use App\Service\Validator\QueryParamsValidator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Security;

/**
 * Provides methods for more complex Thread CRUD operations.
 * NOTE: does NOT save changes to DB on its own!
 */
class ThreadCRUD
{
	private EntityManagerInterface $em;
	private QueryParamsValidator $queryValidator;
	private JsonValidator $jsonValidator;
	private Security $security;
	
	private ThreadRepository $threadRepo;
	
	public function __construct(
		EntityManagerInterface $em,
		QueryParamsValidator $queryValidator,
		JsonValidator $jsonValidator,
		Security $security)
	{
		$this->em = $em;
		$this->queryValidator = $queryValidator;
		$this->jsonValidator = $jsonValidator;
		$this->security = $security;
		
		$this->threadRepo = $em->getRepository(Thread::class);
	}
	
	
	/**
	 * Checks $request for these query params:
	 * orderby, orderdir, page, perpage
	 *
	 * @param Request $request
	 * @return Thread[]|\Knp\Component\Pager\Pagination\PaginationInterface
	 */
	public function getList(Request $request)
	{
		$params = $this->queryValidator->Everything($request, Thread::class, null, ['edited', 'comments', 'author', 'userVote']);
		
		return $this->threadRepo->findByPaginated([], $params['ordering'], $params['pagination']);
	}
	
	public function createNew(Request $request)
	{
		$newThread = $this->jsonValidator->ValidateNew($request->getContent(), Thread::class, ['thread_write']);
		$newThread->setAuthor($this->security->getUser());
		
		return $newThread;
	}
	
	public function edit(Thread $thread, Request $request)
	{
		$thread = $this->jsonValidator->ValidateEdit($request->getContent(), $thread, ['thread_write']);
		$thread->setEdited(true);
		
		return $thread;
	}
}