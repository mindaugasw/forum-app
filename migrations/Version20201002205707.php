<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201002205707 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE vote_comment (comment_id INT NOT NULL, user_id INT NOT NULL, vote SMALLINT NOT NULL, INDEX IDX_1FC60DF4F8697D13 (comment_id), INDEX IDX_1FC60DF4A76ED395 (user_id), PRIMARY KEY(comment_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE vote_comment ADD CONSTRAINT FK_1FC60DF4F8697D13 FOREIGN KEY (comment_id) REFERENCES comment (id)');
        $this->addSql('ALTER TABLE vote_comment ADD CONSTRAINT FK_1FC60DF4A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE comment ADD updated_at DATETIME NOT NULL');
        $this->addSql('CREATE FULLTEXT INDEX IDX_9474526CFEC530A9 ON comment (content)');
        $this->addSql('ALTER TABLE thread CHANGE updated_at updated_at DATETIME NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE vote_comment');
        $this->addSql('DROP INDEX IDX_9474526CFEC530A9 ON comment');
        $this->addSql('ALTER TABLE comment DROP updated_at');
        $this->addSql('ALTER TABLE thread CHANGE updated_at updated_at DATETIME DEFAULT NULL');
    }
}
