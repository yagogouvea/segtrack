/*
  Warnings:

  - You are about to alter the column `valor_acionamento` on the `Contrato` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(10,2)`.
  - You are about to alter the column `valor_hora_extra` on the `Contrato` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(10,2)`.
  - You are about to alter the column `valor_km_extra` on the `Contrato` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `Contrato` ADD COLUMN `permite_negociacao` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `valor_base` DECIMAL(10, 2) NULL,
    ADD COLUMN `valor_km` DECIMAL(10, 2) NULL,
    ADD COLUMN `valor_nao_recuperado` DECIMAL(10, 2) NULL,
    MODIFY `valor_acionamento` DECIMAL(10, 2) NULL,
    MODIFY `valor_hora_extra` DECIMAL(10, 2) NULL,
    MODIFY `valor_km_extra` DECIMAL(10, 2) NULL;

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
