export const MessageHelper = {
  RESOURCE_NOT_FOUND_ERROR: (resource: string) => `${resource} não encontrado`,
  NOT_ALLOWED_ERROR: `Não permitido`,
  USER_ALREADY_EXISTS_ERROR: (reason: string) => `${reason} já está cadastrado`,
  USER_NOT_ACTIVE_ERROR: `Usuário não está ativo`,
  CHAT_ALREADY_EXISTS_ERROR: `Chat já existe`,

  WRONG_CREDENTIALS_ERROR: `Credenciais inválidas`,
  RECOVERY_PASSWORD_CODE_EXPIRED: 'Código de recuperação de senha expirado',
}
