/**
 * Centralized UI strings.
 * - Validation messages (Zod): frontend pre-flight, never reach the backend.
 * - Success/error toasts and fallback messages: backend errors take precedence
 *   via extractErrorMessage; these are fallbacks for network/unexpected failures.
 *
 * Structure mirrors react-i18next namespaces — migrating to i18n later only
 * requires replacing the values with translation keys and wrapping with t().
 */
export const messages = {
  common: {
    loading: 'Carregando...',
    noData: 'Nenhum registro encontrado.',
    back: '← Voltar',
    cancel: 'Cancelar',
    unexpected: 'Um erro inesperado ocorreu.',
    errorTitle: 'Algo deu errado',
    reload: 'Recarregar página',
  },

  validation: {
    emailInvalid: 'Informe um email válido.',
    emailRequired: 'Email é obrigatório.',
    passwordRequired: 'Senha é obrigatória.',
    passwordTooShort: 'Senha deve ter pelo menos 8 caracteres.',
    passwordConfirmRequired: 'Confirmação é obrigatória.',
    passwordMismatch: 'As senhas não coincidem.',
    nameRequired: 'Nome completo é obrigatório.',
    nameTooLong: 'Nome muito longo.',
    orgRequired: 'Selecione uma organização.',
    orgTypeRequired: 'Tipo é obrigatório.',
    cnpjInvalid: 'CNPJ deve conter 14 dígitos numéricos.',
    roleRequired: 'Perfil é obrigatório.',
    unitRequired: 'Selecione ao menos uma unidade para este perfil.',
    unitNameRequired: 'Nome é obrigatório.',
    unitNameTooLong: 'Nome muito longo.',
    unitCodeRequired: 'Código é obrigatório.',
    unitCodeTooLong: 'Código deve ter no máximo 20 caracteres.',
    unitPhoneTooLong: 'Telefone deve ter no máximo 20 caracteres.',
    unitAddressTooLong: 'Endereço muito longo.',
  },

  auth: {
    setPasswordSubmit: 'Definir senha',
    setPasswordSubmitting: 'Salvando...',
    setPasswordError: 'Não foi possível definir a senha. O link pode ter expirado.',
    loginError: 'Email ou senha inválidos.',
  },

  organizations: {
    createSubmit: 'Criar organização',
    createSubmitting: 'Criando...',
    createSuccess: 'Organização criada com sucesso.',
    createError: 'Erro ao criar organização. Verifique os dados e tente novamente.',
  },

  users: {
    inviteSubmit: 'Enviar convite',
    inviteSubmitting: 'Enviando convite...',
    inviteSuccess: 'Convite enviado com sucesso.',
    inviteError: 'Erro ao enviar convite. Verifique os dados e tente novamente.',
    noUnitsForOrg: 'Nenhuma unidade ativa encontrada para esta organização.',
    selectOrgFirst: 'Selecione uma organização para ver as unidades disponíveis.',
    removedFromUnit: 'Usuário removido da unidade.',
    removeFromUnitError: 'Erro ao remover usuário da unidade.',
    updateRoleSuccess: 'Perfil atualizado com sucesso.',
    updateRoleError: 'Erro ao atualizar perfil.',
    assignToUnitSuccess: 'Usuário adicionado à unidade.',
    assignToUnitError: 'Erro ao adicionar usuário à unidade.',
    noUsersInUnit: 'Nenhum usuário atribuído a esta unidade.',
    noUsersAvailable: 'Nenhum usuário disponível para adicionar.',
    selectUser: 'Selecione um usuário...',
  },

  units: {
    createSubmit: 'Criar unidade',
    createSubmitting: 'Criando...',
    createSuccess: 'Unidade criada com sucesso.',
    createError: 'Erro ao criar unidade.',
    updateSubmit: 'Salvar alterações',
    updateSubmitting: 'Salvando...',
    updateSuccess: 'Unidade atualizada com sucesso.',
    updateError: 'Erro ao atualizar unidade.',
    deactivateSuccess: 'Unidade desativada.',
    deactivateError: 'Erro ao desativar unidade.',
  },
} as const
