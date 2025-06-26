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
CREATE TABLE `CampoAdicionalCliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `campo` VARCHAR(191) NOT NULL,

    INDEX `CampoAdicionalCliente_clienteId_fkey`(`clienteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contrato` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NOT NULL,
    `nome_interno` VARCHAR(191) NULL,
    `tipo` ENUM('padrao_regiao', 'acl_km', 'padrao_fixo', 'valor_fechado') NULL,
    `regiao` ENUM('CAPITAL', 'GRANDE_SP', 'INTERIOR', 'OUTROS_ESTADOS') NULL,
    `valor_acionamento` DECIMAL(10, 2) NULL,
    `valor_nao_recuperado` DECIMAL(10, 2) NULL,
    `valor_hora_extra` DECIMAL(10, 2) NULL,
    `valor_km_extra` DECIMAL(10, 2) NULL,
    `franquia_horas` VARCHAR(191) NULL,
    `franquia_km` INTEGER NULL,
    `valor_km` DECIMAL(10, 2) NULL,
    `valor_base` DECIMAL(10, 2) NULL,
    `permite_negociacao` BOOLEAN NULL DEFAULT false,

    INDEX `Contrato_clienteId_fkey`(`clienteId`),
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
    `valor_acionamento` DOUBLE NULL DEFAULT 0,
    `franquia_horas` VARCHAR(191) NULL DEFAULT '',
    `franquia_km` DOUBLE NULL DEFAULT 0,
    `valor_hora_adc` DOUBLE NULL DEFAULT 0,
    `valor_km_adc` DOUBLE NULL DEFAULT 0,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `origem` VARCHAR(191) NULL DEFAULT 'interno',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FuncaoPrestador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `funcao` VARCHAR(191) NOT NULL,
    `prestadorId` INTEGER NOT NULL,

    INDEX `FuncaoPrestador_prestadorId_fkey`(`prestadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegiaoPrestador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regiao` VARCHAR(191) NOT NULL,
    `prestadorId` INTEGER NOT NULL,

    INDEX `RegiaoPrestador_prestadorId_fkey`(`prestadorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TipoVeiculoPrestador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(191) NOT NULL,
    `prestadorId` INTEGER NOT NULL,

    INDEX `TipoVeiculoPrestador_prestadorId_idx`(`prestadorId`),
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
    `descricao` TEXT NULL,
    `resultado` VARCHAR(191) NULL,
    `status` ENUM('em_andamento', 'concluida', 'cancelada', 'aguardando') NOT NULL DEFAULT 'em_andamento',
    `encerrada_em` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,
    `data_acionamento` DATETIME(3) NULL,
    `km_final` DOUBLE NULL,
    `km_inicial` DOUBLE NULL,
    `despesas_detalhadas` JSON NULL,

    INDEX `Ocorrencia_placa1_idx`(`placa1`),
    INDEX `Ocorrencia_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Foto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` TEXT NOT NULL,
    `legenda` TEXT NOT NULL,
    `ocorrenciaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Foto_ocorrenciaId_fkey`(`ocorrenciaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Relatorio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ocorrenciaId` INTEGER NOT NULL,
    `cliente` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `dataAcionamento` DATETIME(3) NOT NULL,
    `caminhoPdf` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'manager', 'operator', 'client') NOT NULL,
    `permissions` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CampoAdicionalCliente` ADD CONSTRAINT `CampoAdicionalCliente_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contrato` ADD CONSTRAINT `Contrato_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FuncaoPrestador` ADD CONSTRAINT `FuncaoPrestador_prestadorId_fkey` FOREIGN KEY (`prestadorId`) REFERENCES `Prestador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegiaoPrestador` ADD CONSTRAINT `RegiaoPrestador_prestadorId_fkey` FOREIGN KEY (`prestadorId`) REFERENCES `Prestador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TipoVeiculoPrestador` ADD CONSTRAINT `TipoVeiculoPrestador_prestadorId_fkey` FOREIGN KEY (`prestadorId`) REFERENCES `Prestador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Foto` ADD CONSTRAINT `Foto_ocorrenciaId_fkey` FOREIGN KEY (`ocorrenciaId`) REFERENCES `Ocorrencia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
