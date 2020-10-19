<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
	/**
     * @Route("/{reactRouting}", name="app_homepage", priority=-100, requirements={"reactRouting"="^(?!(api\/)|(api$)).*"})
     */
    public function index()
    {
		return $this->render('default/index.html.twig');
    }
}
