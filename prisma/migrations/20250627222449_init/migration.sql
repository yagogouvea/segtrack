-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('padrao_regiao', 'acl_km', 'padrao_fixo', 'valor_fechado');

-- CreateEnum
CREATE TYPE "RegiaoContrato" AS ENUM ('CAPITAL', 'GRANDE_SP', 'INTERIOR', 'OUTROS_ESTADOS');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'operator', 'client');

-- CreateEnum
CREATE TYPE "OcorrenciaStatus" AS ENUM ('em_andamento', 'concluida', 'cancelada', 'aguardando');

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "contato" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampoAdicionalCliente" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "campo" TEXT NOT NULL,

    CONSTRAINT "CampoAdicionalCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "nome_interno" TEXT,
    "tipo" "TipoContrato",
    "regiao" "RegiaoContrato",
    "valor_acionamento" DECIMAL(10,2),
    "valor_nao_recuperado" DECIMAL(10,2),
    "valor_hora_extra" DECIMAL(10,2),
    "valor_km_extra" DECIMAL(10,2),
    "franquia_horas" TEXT,
    "franquia_km" INTEGER,
    "valor_km" DECIMAL(10,2),
    "valor_base" DECIMAL(10,2),
    "permite_negociacao" BOOLEAN DEFAULT false,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestador" (
    "id" SERIAL NOT NULL,
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
    "valor_acionamento" DOUBLE PRECISION DEFAULT 0,
    "franquia_horas" TEXT DEFAULT '',
    "franquia_km" DOUBLE PRECISION DEFAULT 0,
    "valor_hora_adc" DOUBLE PRECISION DEFAULT 0,
    "valor_km_adc" DOUBLE PRECISION DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origem" TEXT DEFAULT 'interno',

    CONSTRAINT "Prestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuncaoPrestador" (
    "id" SERIAL NOT NULL,
    "funcao" TEXT NOT NULL,
    "prestadorId" INTEGER NOT NULL,

    CONSTRAINT "FuncaoPrestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegiaoPrestador" (
    "id" SERIAL NOT NULL,
    "regiao" TEXT NOT NULL,
    "prestadorId" INTEGER NOT NULL,

    CONSTRAINT "RegiaoPrestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoVeiculoPrestador" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "prestadorId" INTEGER NOT NULL,

    CONSTRAINT "TipoVeiculoPrestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT,
    "marca" TEXT,
    "cor" TEXT,
    "fabricante" TEXT,
    "ano" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ocorrencia" (
    "id" SERIAL NOT NULL,
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
    "valor_carga" DOUBLE PRECISION,
    "notas_fiscais" TEXT,
    "os" TEXT,
    "origem_bairro" TEXT,
    "origem_cidade" TEXT,
    "origem_estado" TEXT,
    "prestador" TEXT,
    "inicio" TIMESTAMP(3),
    "chegada" TIMESTAMP(3),
    "termino" TIMESTAMP(3),
    "km" DOUBLE PRECISION,
    "despesas" DOUBLE PRECISION,
    "descricao" TEXT,
    "resultado" TEXT,
    "status" "OcorrenciaStatus" NOT NULL DEFAULT 'em_andamento',
    "encerrada_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "data_acionamento" TIMESTAMP(3),
    "km_final" DOUBLE PRECISION,
    "km_inicial" DOUBLE PRECISION,
    "despesas_detalhadas" JSONB,

    CONSTRAINT "Ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "legenda" TEXT NOT NULL,
    "ocorrenciaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relatorio" (
    "id" SERIAL NOT NULL,
    "ocorrenciaId" INTEGER NOT NULL,
    "cliente" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataAcionamento" TIMESTAMP(3) NOT NULL,
    "caminhoPdf" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permissions" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "CampoAdicionalCliente" ADD CONSTRAINT "fk_campo_adicional_cliente" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "fk_contrato_cliente" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuncaoPrestador" ADD CONSTRAINT "fk_funcao_prestador" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegiaoPrestador" ADD CONSTRAINT "fk_regiao_prestador" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoVeiculoPrestador" ADD CONSTRAINT "fk_tipo_veiculo_prestador" FOREIGN KEY ("prestadorId") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "fk_foto_ocorrencia" FOREIGN KEY ("ocorrenciaId") REFERENCES "Ocorrencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
