-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `contato` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `clientes_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contratos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `nome_interno` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `regiao` VARCHAR(191) NULL,
    `valor_acionamento` VARCHAR(191) NULL,
    `valor_hora_extra` VARCHAR(191) NULL,
    `valor_km_extra` VARCHAR(191) NULL,
    `franquia_horas` VARCHAR(191) NULL,
    `franquia_km` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prestadores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `macro_regiao` VARCHAR(191) NOT NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `prestadores_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contratos` ADD CONSTRAINT `contratos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

