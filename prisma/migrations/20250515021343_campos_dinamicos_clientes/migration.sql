-- AlterTable
ALTER TABLE `Foto` MODIFY `url` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `CampoAdicionalCliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `campo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CampoAdicionalCliente` ADD CONSTRAINT `CampoAdicionalCliente_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
