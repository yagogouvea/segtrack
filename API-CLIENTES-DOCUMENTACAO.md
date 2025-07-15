# API de Autenticação de Clientes SEGTRACK

## Visão Geral

Esta API permite que clientes da SEGTRACK façam login usando CNPJ e acessem suas informações através de um sistema de autenticação JWT.

## Endpoints

### 1. Cadastro de Cliente
**POST** `/api/auth/cliente/cadastro`

Cadastra um novo cliente no sistema.

#### Request Body:
```json
{
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "cnpj": "00.000.000/0001-00"
}
```

#### Response (201):
```json
{
  "message": "Cliente cadastrado com sucesso",
  "cliente": {
    "id": 1,
    "razaoSocial": "EMPRESA EXEMPLO LTDA",
    "cnpj": "00000000000100",
    "cidade": null,
    "estado": null
  }
}
```

### 2. Login de Cliente
**POST** `/api/auth/cliente/login`

Realiza login do cliente usando CNPJ.

#### Request Body:
```json
{
  "cnpj": "00.000.000/0001-00",
  "senha": "00000000000100"
}
```

#### Response (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "cliente": {
    "id": 1,
    "razaoSocial": "EMPRESA EXEMPLO LTDA",
    "cnpj": "00000000000100",
    "cidade": "São Paulo",
    "estado": "SP"
  }
}
```

## Rotas Protegidas

Todas as rotas protegidas requerem o header `Authorization: Bearer <token>`.

### 3. Perfil do Cliente
**GET** `/api/protected/cliente/perfil`

Retorna informações do cliente logado.

#### Response (200):
```json
{
  "id": "1",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "cnpj": "00000000000100"
}
```

### 4. Ocorrências do Cliente
**GET** `/api/protected/cliente/ocorrencias`

Retorna lista de ocorrências do cliente.

#### Response (200):
```json
{
  "message": "Lista de ocorrências do cliente",
  "cliente": "EMPRESA EXEMPLO LTDA",
  "ocorrencias": []
}
```

### 5. Relatórios do Cliente
**GET** `/api/protected/cliente/relatorios`

Retorna lista de relatórios do cliente.

#### Response (200):
```json
{
  "message": "Lista de relatórios do cliente",
  "cliente": "EMPRESA EXEMPLO LTDA",
  "relatorios": []
}
```

## Autenticação

### Token JWT
- **Validade**: 7 dias
- **Payload**: Contém informações do cliente (ID, razão social, CNPJ)
- **Tipo**: `cliente`

### Headers Necessários
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Normalização de CNPJ

O sistema automaticamente normaliza CNPJs removendo pontos, traços e barras:
- `00.000.000/0001-00` → `00000000000100`
- `00-000-000-0001-00` → `00000000000100`

## Senha Padrão

Por padrão, a senha do cliente é igual ao CNPJ normalizado:
- CNPJ: `00.000.000/0001-00`
- Senha: `00000000000100`

## Códigos de Erro

### 400 - Bad Request
- CNPJ inválido
- Dados obrigatórios ausentes
- Cliente já existe (cadastro)

### 401 - Unauthorized
- Token não fornecido
- Cliente não encontrado
- CNPJ ou senha incorretos

### 403 - Forbidden
- Token inválido
- Token não é de cliente

### 500 - Internal Server Error
- Erro de configuração do servidor
- Erro interno do banco de dados

## Exemplo de Uso

### 1. Cadastrar Cliente
```bash
curl -X POST http://localhost:8080/api/auth/cliente/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "razaoSocial": "EMPRESA TESTE LTDA",
    "cnpj": "00.000.000/0001-00"
  }'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:8080/api/auth/cliente/login \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj": "00.000.000/0001-00",
    "senha": "00000000000100"
  }'
```

### 3. Acessar Perfil
```bash
curl -X GET http://localhost:8080/api/protected/cliente/perfil \
  -H "Authorization: Bearer <token>"
```

## Teste Automatizado

Execute o script de teste para verificar se tudo está funcionando:

```bash
node test-cliente-auth.js
```

## Integração com Frontend

### Configuração do Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cliente_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Login
```javascript
const loginCliente = async (cnpj, senha) => {
  try {
    const response = await api.post('/auth/cliente/login', { cnpj, senha });
    localStorage.setItem('cliente_token', response.data.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

### Acessar Dados Protegidos
```javascript
const getPerfilCliente = async () => {
  try {
    const response = await api.get('/protected/cliente/perfil');
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

## Segurança

- Tokens JWT com validade de 7 dias
- Normalização automática de CNPJ
- Validação de formato de CNPJ
- Middleware específico para clientes
- Headers de segurança configurados 