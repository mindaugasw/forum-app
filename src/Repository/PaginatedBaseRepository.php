<?php


namespace App\Repository;


use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Knp\Component\Pager\Event\Subscriber\Paginate\Callback\CallbackPagination;
use Knp\Component\Pager\PaginatorInterface;

abstract class PaginatedBaseRepository extends ServiceEntityRepository
{
	private PaginatorInterface $paginator;
	
	public function __construct(ManagerRegistry $registry, string $entityClass, PaginatorInterface $paginator) // TODO move $paginator to setter DI
	{
		parent::__construct($registry, $entityClass);
		$this->paginator = $paginator;
	}
	
	/**
	 * @param array|null $criteria Selection criteria array ['property' => value]
	 * @param array|null $orderBy Sorting array ['property' => 'ASC|DESC']
	 * @param array $pagination Should be integer array with 2 keys: page, perpage 
	 * @return \Knp\Component\Pager\Pagination\PaginationInterface
	 */
	public function findByPaginated(array $criteria = null, array $orderBy = null, array $pagination = []/*, bool $doCount = true*/)
	{
		$repo = $this;
		
		// from https://github.com/KnpLabs/knp-components/blob/master/docs/pager/intro.md#custom-data-repository-pagination
		$countFunc = function () use ($repo, $criteria) {
			return $repo->count($criteria);
			// TODO implement checking if doCount is true
			//      Results should not be counted on expensive queries (full text search)
			
			// TODO create a custom paginator to use with unknown total items count
		};
		$itemsFunc = function ($offset, $limit) use ($repo, $criteria, $orderBy) {
			return $repo->findBy($criteria, $orderBy, $limit, $offset);
		};
		
		$target = new CallbackPagination($countFunc, $itemsFunc);
		return $this->paginator->paginate($target, $pagination['page'], $pagination['perpage']);
	}
}