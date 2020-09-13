<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class DefaultController extends BaseController
{
	/**
     * @Route("/", name="app_homepage")
     */
    public function index()
    {
        return $this->render('default/index.html.twig');
    }
	
	/**
	 * @Route("/t1")
	 */
    public function test1()
	{
		$content = $this->em->getRepository(User::class)->findAll();
		
		$serialized = $this->serializer->serialize($content, 'jsonld');
		return new JsonResponse($serialized, 200, [], true);
	}
}
