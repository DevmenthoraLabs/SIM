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
    noDataHint: 'Crie o primeiro registro para começar.',
    back: '← Voltar',
    cancel: 'Cancelar',
    unexpected: 'Um erro inesperado ocorreu.',
    errorTitle: 'Algo deu errado',
    errorDescription: 'Ocorreu um erro inesperado. Tente recarregar a página.',
    reload: 'Recarregar página',
    notFoundTitle: 'Página não encontrada',
    notFoundDescription: 'A página que você procura não existe ou foi movida.',
    backToHome: 'Voltar ao início',
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
    loginTitle: 'Bem-vindo ao SIM',
    loginDescription: 'Entre com suas credenciais para acessar o sistema.',
    loginSubmit: 'Entrar',
    loginSubmitting: 'Entrando...',
    loginSupport: 'Problemas para acessar? Entre em contato com o suporte SIM.',
    loginError: 'Email ou senha inválidos.',
    setPasswordSubmit: 'Definir senha',
    setPasswordSubmitting: 'Salvando...',
    setPasswordError: 'Não foi possível definir a senha. O link pode ter expirado.',
    callbackInvalidTitle: 'Link inválido ou expirado',
    callbackInvalidDescription: 'Solicite um novo convite ou recuperação de senha.',
  },

  organizations: {
    createSubmit: 'Criar organização',
    createSubmitting: 'Criando...',
    createSuccess: 'Organização criada com sucesso.',
    createError: 'Erro ao criar organização. Verifique os dados e tente novamente.',
    dialogTitle: 'Nova organização',
    dialogDescription: 'Preencha os dados para cadastrar uma nova organização.',
  },

  users: {
    inviteSubmit: 'Enviar convite',
    inviteSubmitting: 'Enviando convite...',
    inviteSuccess: 'Convite enviado com sucesso!',
    inviteSuccessHint: 'O usuário receberá um email para definir sua senha.',
    inviteError: 'Erro ao enviar convite. Verifique os dados e tente novamente.',
    inviteDialogTitle: 'Convidar usuário',
    inviteDialogDescription: 'Envie um convite por email para um novo usuário.',
    assignDialogTitle: 'Adicionar usuário à unidade',
    assignDialogDescription: 'Selecione o usuário que deseja vincular.',
    assignSubmit: 'Adicionar',
    assignSubmitting: 'Adicionando...',
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
    createDialogTitle: 'Nova unidade',
    createDialogDescription: 'Preencha os dados para cadastrar uma nova unidade.',
    editDialogTitle: 'Editar unidade',
  },

  breadcrumbs: {
    units: 'Unidades',
    users: 'Usuários',
    suporte: 'Suporte',
    organizations: 'Organizações',
    invite: 'Convidar usuário',
  },

  pages: {
    dashboardGreeting: 'Olá, {email}',
    dashboardDescription: 'Bem-vindo ao SIM.',
    unitsTitle: 'Unidades',
    unitsDescription: 'Gerencie as unidades da organização',
    usersTitle: 'Usuários',
    usersDescription: 'Gerencie os usuários da organização',
    organizationsTitle: 'Organizações',
    organizationsDescription: 'Gerencie as organizações do sistema',
    inviteUserTitle: 'Convidar usuário',
  },
} as const
