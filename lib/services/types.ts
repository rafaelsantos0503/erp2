/**
 * Tipos comuns para respostas paginadas do Spring Boot
 */

export interface PageRequest {
  page?: number; // Número da página (0-indexed, padrão: 0)
  size?: number; // Tamanho da página (padrão: 10)
  sort?: string; // Campo para ordenação (ex: "nome,asc" ou "data,desc")
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Página atual (0-indexed)
  first: boolean;
  last: boolean;
  numberOfElements: number; // Número de elementos na página atual
  empty: boolean;
}

