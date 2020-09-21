<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class UserFixtures extends BaseFixture
{
	public const USER_REFERENCE = 'users';
	public const COUNT = 50;
	
	private $passwordEncoder;
	
	public function __construct(UserPasswordEncoderInterface $passwordEncoder)
	{
		$this->passwordEncoder = $passwordEncoder;
	}
	
	public function loadData(ObjectManager $manager)
    {
    	for ($i = 0; $i < self::COUNT; $i++) {
			$user = new User();
			$user->setUsername("user".($i+1));
			$user->setPassword($this->passwordEncoder->encodePassword($user, 'password'));
			$this->addReference(self::USER_REFERENCE.'_'.$i, $user);
			$manager->persist($user);
		}
    	
    	$manager->flush();
    	
    	
		/*$this->createMany(self::COUNT, self::USER_REFERENCE, function (int $i) {
			$user = new User();
			$user->setUsername("user".($i+1));
			$user->setPassword($this->passwordEncoder->encodePassword($user, 'password'));
			return $user;
		});
		
        $manager->flush();*/
    }
}
