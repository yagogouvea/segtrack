/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `updatedAt` DATETIME(3) NULL,
    MODIFY `permissions` VARCHAR(191) NOT NULL DEFAULT '[]';

-- Atualiza os registros existentes com o valor atual
UPDATE `User` SET `updatedAt` = NOW();

-- Torna a coluna NOT NULL
ALTER TABLE `User` MODIFY `updatedAt` DATETIME(3) NOT NULL;
