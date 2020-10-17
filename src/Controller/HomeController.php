<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends BaseController
{
	/**
     * @Route("/{reactRouting}", name="app_homepage", priority=-100, requirements={"reactRouting"="^(?!(api\/)|(api$)).*"})
     */
    public function index()
    {
    	//$env = $this->getParameter('kernel.environment');
    	//
    	//if ($env === 'prod')
		//	return new Response("Hello world");
		//else
		return $this->render('default/index.html.twig'); // Twig template on dev to enable profiler toolbar
    }
}
