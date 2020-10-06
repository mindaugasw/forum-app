<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201006203254 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE vote_thread DROP FOREIGN KEY FK_3DC73ED9A76ED395');
        $this->addSql('ALTER TABLE vote_thread DROP FOREIGN KEY FK_3DC73ED9E2904019');
        $this->addSql('ALTER TABLE vote_thread ADD CONSTRAINT FK_3DC73ED9A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE vote_thread ADD CONSTRAINT FK_3DC73ED9E2904019 FOREIGN KEY (thread_id) REFERENCES thread (id) ON DELETE CASCADE');
	
		$this->addSql('ALTER TABLE vote_comment DROP FOREIGN KEY FK_1FC60DF4A76ED395');
		$this->addSql('ALTER TABLE vote_comment DROP FOREIGN KEY FK_1FC60DF4F8697D13');
		$this->addSql('ALTER TABLE vote_comment ADD CONSTRAINT FK_1FC60DF4A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
		$this->addSql('ALTER TABLE vote_comment ADD CONSTRAINT FK_1FC60DF4F8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE vote_thread DROP FOREIGN KEY FK_3DC73ED9E2904019');
        $this->addSql('ALTER TABLE vote_thread DROP FOREIGN KEY FK_3DC73ED9A76ED395');
        $this->addSql('ALTER TABLE vote_thread ADD CONSTRAINT FK_3DC73ED9E2904019 FOREIGN KEY (thread_id) REFERENCES thread (id)');
        $this->addSql('ALTER TABLE vote_thread ADD CONSTRAINT FK_3DC73ED9A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
	
		$this->addSql('ALTER TABLE vote_comment DROP FOREIGN KEY FK_1FC60DF4F8697D13');
		$this->addSql('ALTER TABLE vote_comment DROP FOREIGN KEY FK_1FC60DF4A76ED395');
		$this->addSql('ALTER TABLE vote_comment ADD CONSTRAINT FK_1FC60DF4F8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)');
		$this->addSql('ALTER TABLE vote_comment ADD CONSTRAINT FK_1FC60DF4A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }
}
