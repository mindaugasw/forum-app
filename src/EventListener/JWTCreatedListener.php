<?php

namespace App\EventListener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;

/**
 * Changes created JWT payload to include user id
 */
class JWTCreatedListener
{
	public function onJWTCreated(JWTCreatedEvent $event)
	{
		/** @var User $user */
		$user = $event->getUser();
		$payload = $event->getData();
		$payload['id'] = $user->getId();
		$event->setData($payload);
	}
}