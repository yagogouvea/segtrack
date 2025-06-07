import bcrypt from 'bcryptjs';

/**
 * Gera um hash seguro para a senha usando bcrypt
 * @param password A senha em texto plano
 * @returns O hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica se uma senha em texto plano corresponde a um hash
 * @param password A senha em texto plano
 * @param hash O hash da senha
 * @returns true se a senha corresponde ao hash, false caso contrário
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Gera um hash seguro para um token
 * @param token O token em texto plano
 * @returns O hash do token
 */
export async function hashToken(token: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(token, salt);
}

/**
 * Verifica se um token em texto plano corresponde a um hash
 * @param token O token em texto plano
 * @param hash O hash do token
 * @returns true se o token corresponde ao hash, false caso contrário
 */
export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
} 