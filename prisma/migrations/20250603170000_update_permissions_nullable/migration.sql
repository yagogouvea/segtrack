-- Primeiro, atualiza os registros existentes que têm NULL para '[]'
UPDATE `User` SET `permissions` = '[]' WHERE `permissions` IS NULL;

-- Altera a coluna permissions para aceitar NULL e define o valor padrão
ALTER TABLE `User` MODIFY `permissions` TEXT NULL DEFAULT '[]'; 