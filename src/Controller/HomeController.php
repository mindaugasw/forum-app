<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
	// TODO change path regex to not match asset files (/assets/*, /build/*)
	/**
     * @Route("/{reactRouting}", name="app_homepage", priority=-100, requirements={"reactRouting"="^(?!(api\/)|(api$)).*"})
     */
    public function index()
    {
		return $this->render('default/index.html.twig');
    }
}
