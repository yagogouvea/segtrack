import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

export const COGNITO_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  userPoolId: process.env.COGNITO_USER_POOL_ID || '',
  clientId: process.env.COGNITO_CLIENT_ID || '',
  clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
  tokenUse: 'access', // ou 'id'
  tokenExpiration: 3600000, // 1 hora em milissegundos
};

// Cliente do Cognito
export const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Tipos para usuários do Cognito
export interface CognitoUser {
  username: string;
  email: string;
  sub: string;
  groups?: string[];
  empresa_id?: string;
  custom_attributes?: Record<string, string>;
}

// Interface para tokens
export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Enum para grupos de usuários
export enum CognitoGroups {
  ADMIN = 'Administradores',
  GESTOR = 'Gestores',
  USUARIO = 'Usuarios',
} 