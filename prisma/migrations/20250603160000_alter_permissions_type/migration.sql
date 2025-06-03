-- Primeiro, atualiza os registros existentes que têm NULL para '[]'
UPDATE `User` SET `permissions` = '[]' WHERE `permissions` IS NULL;

-- Remove o valor padrão
ALTER TABLE `User` ALTER COLUMN `permissions` DROP DEFAULT;

-- Altera o tipo para TEXT
ALTER TABLE `User` MODIFY `permissions` TEXT NOT NULL; 