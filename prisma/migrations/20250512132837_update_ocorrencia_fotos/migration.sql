-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `contato` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `nome_interno` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NULL,
    `regiao` VARCHAR(191) NULL,
    `valor_acionamento` VARCHAR(191) NULL,
    `valor_hora_extra` VARCHAR(191) NULL,
    `valor_km_extra` VARCHAR(191) NULL,
    `franquia_horas` VARCHAR(191) NULL,
    `franquia_km` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prestador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `cod_nome` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `aprovado` BOOLEAN NOT NULL DEFAULT false,
    `tipo_pix` VARCHAR(191) NULL,
    `chave_pix` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `valor_acionamento` VARCHAR(191) NULL,
    `franquia_horas` VARCHAR(191) NULL,
    `franquia_km` VARCHAR(191) NULL,
    `valor_hora_adc` VARCHAR(191) NULL,
    `valor_km_adc` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FuncaoPrestador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `funcao` VARCHAR(191) NOT NULL,
    `prestadorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegiaoPrestador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regiao` VARCHAR(191) NOT NULL,
    `prestadorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Veiculo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `placa` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NULL,
    `marca` VARCHAR(191) NULL,
    `cor` VARCHAR(191) NULL,
    `fabricante` VARCHAR(191) NULL,
    `ano` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Veiculo_placa_key`(`placa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ocorrencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `placa1` VARCHAR(191) NOT NULL,
    `placa2` VARCHAR(191) NULL,
    `placa3` VARCHAR(191) NULL,
    `modelo1` VARCHAR(191) NULL,
    `cor1` VARCHAR(191) NULL,
    `cliente` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `tipo_veiculo` VARCHAR(191) NULL,
    `coordenadas` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `cpf_condutor` VARCHAR(191) NULL,
    `nome_condutor` VARCHAR(191) NULL,
    `transportadora` VARCHAR(191) NULL,
    `valor_carga` DOUBLE NULL,
    `notas_fiscais` VARCHAR(191) NULL,
    `os` VARCHAR(191) NULL,
    `origem_bairro` VARCHAR(191) NULL,
    `origem_cidade` VARCHAR(191) NULL,
    `origem_estado` VARCHAR(191) NULL,
    `prestador` VARCHAR(191) NULL,
    `inicio` DATETIME(3) NULL,
    `chegada` DATETIME(3) NULL,
    `termino` DATETIME(3) NULL,
    `km` DOUBLE NULL,
    `despesas` DOUBLE NULL,
    `descricao` VARCHAR(191) NULL,
    `fotos` VARCHAR(191) NULL,
    `resultado` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Em andamento',
    `encerrada_em` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FuncaoPrestador` ADD CONSTRAINT `FuncaoPrestador_prestadorId_fkey` FOREIGN KEY (`prestadorId`) REFERENCES `Prestador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegiaoPrestador` ADD CONSTRAINT `RegiaoPrestador_prestadorId_fkey` FOREIGN KEY (`prestadorId`) REFERENCES `Prestador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
