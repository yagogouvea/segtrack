/*
  Warnings:

  - You are about to drop the column `plata_origem` on the `Ocorrencia` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ocorrencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placa1" TEXT NOT NULL,
    "placa2" TEXT,
    "placa3" TEXT,
    "modelo1" TEXT,
    "cor1" TEXT,
    "cliente" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tipo_veiculo" TEXT,
    "coordenadas" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cpf_condutor" TEXT,
    "nome_condutor" TEXT,
    "transportadora" TEXT,
    "valor_carga" REAL,
    "notas_fiscais" TEXT,
    "os" TEXT,
    "origem_bairro" TEXT,
    "origem_cidade" TEXT,
    "origem_estado" TEXT,
    "prestador" TEXT,
    "inicio" DATETIME,
    "chegada" DATETIME,
    "termino" DATETIME,
    "km" REAL,
    "despesas" REAL,
    "descricao" TEXT,
    "resultado" TEXT,
    "status" TEXT NOT NULL DEFAULT 'em_andamento',
    "encerrada_em" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    "data_acionamento" DATETIME,
    "km_final" REAL,
    "km_inicial" REAL,
    "despesas_detalhadas" TEXT,
    "planta_origem" TEXT,
    "cidade_destino" TEXT,
    "km_acl" TEXT
);
INSERT INTO "new_Ocorrencia" ("atualizado_em", "bairro", "chegada", "cidade", "cidade_destino", "cliente", "coordenadas", "cor1", "cpf_condutor", "criado_em", "data_acionamento", "descricao", "despesas", "despesas_detalhadas", "encerrada_em", "endereco", "estado", "id", "inicio", "km", "km_acl", "km_final", "km_inicial", "modelo1", "nome_condutor", "notas_fiscais", "origem_bairro", "origem_cidade", "origem_estado", "os", "placa1", "placa2", "placa3", "prestador", "resultado", "status", "termino", "tipo", "tipo_veiculo", "transportadora", "valor_carga") SELECT "atualizado_em", "bairro", "chegada", "cidade", "cidade_destino", "cliente", "coordenadas", "cor1", "cpf_condutor", "criado_em", "data_acionamento", "descricao", "despesas", "despesas_detalhadas", "encerrada_em", "endereco", "estado", "id", "inicio", "km", "km_acl", "km_final", "km_inicial", "modelo1", "nome_condutor", "notas_fiscais", "origem_bairro", "origem_cidade", "origem_estado", "os", "placa1", "placa2", "placa3", "prestador", "resultado", "status", "termino", "tipo", "tipo_veiculo", "transportadora", "valor_carga" FROM "Ocorrencia";
DROP TABLE "Ocorrencia";
ALTER TABLE "new_Ocorrencia" RENAME TO "Ocorrencia";
CREATE INDEX "Ocorrencia_placa1_idx" ON "Ocorrencia"("placa1");
CREATE INDEX "Ocorrencia_status_idx" ON "Ocorrencia"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
