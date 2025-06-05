import { 
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AttributeType
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, COGNITO_CONFIG, CognitoUser, CognitoTokens } from '../config/cognito.config';
import { createHmac } from 'crypto';

export class AuthService {
  private static generateSecretHash(username: string): string {
    return createHmac('SHA256', COGNITO_CONFIG.clientSecret)
      .update(username + COGNITO_CONFIG.clientId)
      .digest('base64');
  }

  static async login(email: string, password: string): Promise<CognitoTokens> {
    try {
      const command = new AdminInitiateAuthCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        ClientId: COGNITO_CONFIG.clientId,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: this.generateSecretHash(email)
        }
      });

      const response = await cognitoClient.send(command);

      if (!response.AuthenticationResult) {
        throw new Error('Falha na autenticação');
      }

      return {
        accessToken: response.AuthenticationResult.AccessToken || '',
        idToken: response.AuthenticationResult.IdToken || '',
        refreshToken: response.AuthenticationResult.RefreshToken || '',
        expiresIn: response.AuthenticationResult.ExpiresIn || 3600
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error('Falha na autenticação');
    }
  }

  static async createUser(userData: {
    email: string;
    password: string;
    nome: string;
    empresa_id: string;
    grupo: string;
  }): Promise<CognitoUser> {
    try {
      // Criar usuário
      const createCommand = new AdminCreateUserCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: userData.email,
        UserAttributes: [
          { Name: 'email', Value: userData.email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'custom:empresa_id', Value: userData.empresa_id },
          { Name: 'name', Value: userData.nome }
        ],
        MessageAction: 'SUPPRESS'
      });

      await cognitoClient.send(createCommand);

      // Definir senha
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: userData.email,
        Password: userData.password,
        Permanent: true
      });

      await cognitoClient.send(setPasswordCommand);

      // Adicionar ao grupo
      const addToGroupCommand = new AdminAddUserToGroupCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: userData.email,
        GroupName: userData.grupo
      });

      await cognitoClient.send(addToGroupCommand);

      return {
        username: userData.email,
        email: userData.email,
        sub: '', // Será preenchido ao buscar o usuário
        empresa_id: userData.empresa_id,
        groups: [userData.grupo]
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error('Falha ao criar usuário');
    }
  }

  static async getUser(username: string): Promise<CognitoUser> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: username
      });

      const response = await cognitoClient.send(command);
      
      const attributes = response.UserAttributes?.reduce((acc, attr) => {
        acc[attr.Name] = attr.Value || '';
        return acc;
      }, {} as Record<string, string>);

      return {
        username: username,
        email: attributes?.['email'] || '',
        sub: attributes?.['sub'] || '',
        empresa_id: attributes?.['custom:empresa_id'] || '',
        custom_attributes: attributes
      };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw new Error('Falha ao buscar usuário');
    }
  }

  static async updateUser(username: string, attributes: Record<string, string>): Promise<void> {
    try {
      const userAttributes: AttributeType[] = Object.entries(attributes).map(([Name, Value]) => ({
        Name,
        Value
      }));

      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: username,
        UserAttributes: userAttributes
      });

      await cognitoClient.send(command);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Falha ao atualizar usuário');
    }
  }
} 