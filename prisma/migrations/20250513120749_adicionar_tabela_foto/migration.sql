/*
  Warnings:

  - You are about to drop the column `fotos` on the `Ocorrencia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Ocorrencia` DROP COLUMN `fotos`;

-- CreateTable
CREATE TABLE `Foto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `legenda` VARCHAR(191) NOT NULL,
    `ocorrenciaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Foto` ADD CONSTRAINT `Foto_ocorrenciaId_fkey` FOREIGN KEY (`ocorrenciaId`) REFERENCES `Ocorrencia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
