/**
 * Utilitários para cálculos da oficina
 */

import type { Funcionario } from "./types";
import type { Servico } from "./servicos/page";

// Configurações (normalmente viriam do backend ou contexto)
export interface ConfiguracoesFinanceiras {
  valoresOperacionais: Array<{ id: number; descricao: string; valor: number }>;
  mediaAtendimentosMensais: number;
  margemLucroPorAtendimento: number; // percentual
}

/**
 * Calcula o valor/hora do funcionário baseado no valorDespesa
 * Assumindo 176 horas por mês (44h semanais × 4 semanas)
 */
export function calcularValorHoraFuncionario(funcionario: Funcionario): number {
  const HORAS_TRABALHADAS_MES = 176; // 44h semanais × 4 semanas
  if (!funcionario.valorDespesa) {
    return 0;
  }
  return funcionario.valorDespesa / HORAS_TRABALHADAS_MES;
}

/**
 * Calcula o custo médio por atendimento
 */
export function calcularCustoMedioAtendimento(config: ConfiguracoesFinanceiras): number {
  const totalValoresOperacionais = config.valoresOperacionais.reduce((sum, v) => sum + v.valor, 0);
  if (config.mediaAtendimentosMensais <= 0) {
    return 0;
  }
  return totalValoresOperacionais / config.mediaAtendimentosMensais;
}

/**
 * Calcula o valor estimado de um serviço
 * @param servico - Serviço selecionado
 * @param funcionario - Funcionário que executará o serviço
 * @param config - Configurações financeiras
 * @returns Valor total estimado (custo médio + mão de obra + margem de lucro)
 */
export function calcularValorEstimadoServico(
  servico: Servico,
  funcionario: Funcionario,
  config: ConfiguracoesFinanceiras
): {
  valorHoraFuncionario: number;
  valorMaoObra: number;
  custoMedio: number;
  margemLucro: number;
  valorTotal: number;
} {
  const valorHoraFuncionario = calcularValorHoraFuncionario(funcionario);
  const valorMaoObra = servico.tempoEstimadoHoras * valorHoraFuncionario;
  const custoMedio = calcularCustoMedioAtendimento(config);
  const margemLucro = (valorMaoObra + custoMedio) * (config.margemLucroPorAtendimento / 100);
  const valorTotal = custoMedio + valorMaoObra + margemLucro;

  return {
    valorHoraFuncionario,
    valorMaoObra,
    custoMedio,
    margemLucro,
    valorTotal,
  };
}

