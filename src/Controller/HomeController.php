<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends BaseController
{
	/**
     * @Route("/", name="app_homepage")
     */
    public function index()
    {
        return new Response("Hello world");
    }
}
