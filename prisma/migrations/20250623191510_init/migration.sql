-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "contato" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT
);

-- CreateTable
CREATE TABLE "CampoAdicionalCliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    CONSTRAINT "CampoAdicionalCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "nome_interno" TEXT,
    "tipo" TEXT,
    "regiao" TEXT,
    "valor_acionamento" REAL,
    "valor_nao_recuperado" REAL,
    "valor_hora_extra" REAL,
    "valor_km_extra" REAL,
    "franquia_horas" TEXT,
    "franquia_km" INTEGER,
    "valor_km" REAL,
    "valor_base" REAL,
    "permite_negociacao" BOOLEAN DEFAULT false,
    CONSTRAINT "Contrato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prestador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cod_nome" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "tipo_pix" TEXT,
    "chave_pix" TEXT,
    "cep" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "valor_acionamento" REAL DEFAULT 0,
    "franquia_horas" TEXT DEFAULT '',
    "franquia_km" REAL DEFAULT 0,
    "valor_hora_adc" REAL DEFAULT 0,
    "valor_km_adc" REAL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origem" TEXT DEFAULT 'interno'
);

-- CreateTable
CREATE TABLE "FuncaoPrestador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "funcao" TEXT NOT NULL,
    "prestadorId" INTEGER NOT NULL,
    CONSTRAINT "FuncaoPrestador_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegiaoPrestador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regiao" TEXT NOT NULL,
    "prestadorId" INTEGER NOT NULL,
    CONSTRAINT "RegiaoPrestador_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TipoVeiculoPrestador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "prestadorId" INTEGER NOT NULL,
    CONSTRAINT "TipoVeiculoPrestador_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "placa" TEXT NOT NULL,
    "modelo" TEXT,
    "marca" TEXT,
    "cor" TEXT,
    "fabricante" TEXT,
    "ano" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ocorrencia" (
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
    "despesas_detalhadas" TEXT
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "legenda" TEXT NOT NULL,
    "ocorrenciaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Foto_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "Ocorrencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Relatorio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "permissions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "CampoAdicionalCliente_clienteId_idx" ON "CampoAdicionalCliente"("clienteId");

-- CreateIndex
CREATE INDEX "Contrato_clienteId_idx" ON "Contrato"("clienteId");

-- CreateIndex
CREATE INDEX "FuncaoPrestador_prestadorId_idx" ON "FuncaoPrestador"("prestadorId");

-- CreateIndex
CREATE INDEX "RegiaoPrestador_prestadorId_idx" ON "RegiaoPrestador"("prestadorId");

-- CreateIndex
CREATE INDEX "TipoVeiculoPrestador_prestadorId_idx" ON "TipoVeiculoPrestador"("prestadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_placa_key" ON "Veiculo"("placa");

-- CreateIndex
CREATE INDEX "Ocorrencia_placa1_idx" ON "Ocorrencia"("placa1");

-- CreateIndex
CREATE INDEX "Ocorrencia_status_idx" ON "Ocorrencia"("status");

-- CreateIndex
CREATE INDEX "Foto_ocorrenciaId_idx" ON "Foto"("ocorrenciaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
