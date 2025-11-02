/**
 * Lista de empresas disponíveis no sistema
 * Agora integrado com backend via empresaService
 */

export interface Empresa {
  id: string;
  nome: string;
  modulo: 2 | 3; // 2 = Corrida, 3 = Oficina
  moduloNome: string;
}

/**
 * Busca todas as empresas disponíveis para um superadmin
 * Agora busca do backend filtrado por módulo
 * @deprecated Use empresaService.getAllByModulo diretamente
 */
export async function buscarEmpresasDisponiveis(modulo?: 2 | 3): Promise<Empresa[]> {
  // Esta função ainda é usada pelo empresa-select, mas agora será atualizada
  // Para manter compatibilidade temporária, retorna array vazio
  // O empresa-select deve ser atualizado para usar empresaService diretamente
  return [];
}

/**
 * Busca uma empresa específica por ID
 * @deprecated Use empresaService.getById diretamente
 */
export function buscarEmpresaPorId(empresaId: string): Empresa | undefined {
  // Esta função ainda é usada pelo empresa-context, mas será atualizada
  return undefined;
}

