-- MySQL Schema Migration for stk_menu database
-- Run: mysql -u root -p stk_menu < migrations/001_create_menus_table.sql

CREATE TABLE IF NOT EXISTS `menus` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(1024) NOT NULL,
  `parent_id` INT NULL,
  `position` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_menus_name` (`name`),
  KEY `IDX_menus_parent_id` (`parent_id`),
  CONSTRAINT `FK_menus_parent` 
    FOREIGN KEY (`parent_id`) 
    REFERENCES `menus` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;