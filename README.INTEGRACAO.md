# Integração Frontend-Backend

Este documento descreve a integração do frontend Next.js com o backend Java Spring Boot.

## Estrutura de Integração

### 1. Variáveis de Ambiente

Configure as variáveis de ambiente no arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_ENV=local
```

### 2. Serviços de API

Os serviços de integração estão em `lib/services/`:

- `lib/services/ordem-servico.service.ts` - Ordens de Serviço
- `lib/services/cliente.service.ts` - Clientes
- `lib/services/funcionario.service.ts` - Funcionários
- `lib/services/financeiro.service.ts` - Financeiro (Contas a Pagar/Receber, Contas Bancárias)
- `lib/services/servico.service.ts` - Serviços

### 3. Uso dos Serviços

**IMPORTANTE**: Todos os serviços recebem o objeto `api` retornado por `useApi()` como primeiro parâmetro.

Exemplo de uso em um componente:

```typescript
"use client";

import { useApi } from "@/lib/api";
import { ordemServicoService } from "@/lib/services/ordem-servico.service";
import { useEffect, useState } from "react";

export default function MinhaPage() {
  const api = useApi();
  const [ordens, setOrdens] = useState([]);

  useEffect(() => {
    const carregarOrdens = async () => {
      try {
        // Passa o objeto api e parâmetros de paginação
        const pagina = await ordemServicoService.getAll(api, { page: 0, size: 10 });
        setOrdens(pagina.content); // pagina.content contém o array de dados
        // pagina.totalElements: total de elementos
        // pagina.totalPages: total de páginas
        // pagina.number: página atual (0-indexed)
      } catch (error) {
        console.error("Erro ao carregar ordens:", error);
      }
    };
    carregarOrdens();
  }, [api]);

  // Criar nova ordem
  const criarOrdem = async (dadosOrdem: any) => {
    try {
      const novaOrdem = await ordemServicoService.create(api, dadosOrdem);
      setOrdens([...ordens, novaOrdem]);
    } catch (error) {
      console.error("Erro ao criar ordem:", error);
    }
  };

  // ...
}
```

**Exemplo completo com paginação:**

```typescript
"use client";

import { useApi } from "@/lib/api";
import { ordemServicoService } from "@/lib/services/ordem-servico.service";
import { useEffect, useState } from "react";

export default function OrdemServicoPage() {
  const api = useApi();
  const [ordens, setOrdens] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0); // 0-indexed
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [carregando, setCarregando] = useState(false);

  const carregarOrdens = async (page: number, size: number) => {
    setCarregando(true);
    try {
      const pagina = await ordemServicoService.getAll(api, {
        page: page,
        size: size,
        sort: "dataEntrada,desc" // Ordena por data de entrada, mais recente primeiro
      });
      
      setOrdens(pagina.content);
      setTotalPaginas(pagina.totalPages);
      setTotalElementos(pagina.totalElements);
      setPaginaAtual(pagina.number);
    } catch (error) {
      console.error("Erro ao carregar ordens:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarOrdens(paginaAtual, itensPorPagina);
  }, [paginaAtual, itensPorPagina]);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  const mudarItensPorPagina = (novoTamanho: number) => {
    setItensPorPagina(novoTamanho);
    setPaginaAtual(0); // Volta para primeira página ao mudar tamanho
  };

  return (
    <div>
      {/* Lista de ordens */}
      {ordens.map(ordem => (
        <div key={ordem.id}>{ordem.numero}</div>
      ))}
      
      {/* Controles de paginação */}
      <div>
        <button 
          onClick={() => mudarPagina(paginaAtual - 1)} 
          disabled={paginaAtual === 0}
        >
          Anterior
        </button>
        <span>Página {paginaAtual + 1} de {totalPaginas}</span>
        <button 
          onClick={() => mudarPagina(paginaAtual + 1)} 
          disabled={paginaAtual >= totalPaginas - 1}
        >
          Próxima
        </button>
        <select 
          value={itensPorPagina} 
          onChange={(e) => mudarItensPorPagina(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      
      <p>Total: {totalElementos} ordens</p>
    </div>
  );
}
```

## Paginação

O backend Spring Boot já retorna dados paginados. Todos os métodos `getAll()` suportam paginação:

```typescript
// Sem paginação (retorna primeira página com 10 itens por padrão)
const pagina = await ordemServicoService.getAll(api);

// Com paginação customizada
const pagina = await ordemServicoService.getAll(api, {
  page: 0,        // Página (0-indexed)
  size: 20,       // Itens por página
  sort: "nome,asc" // Ordenação (opcional)
});

// Estrutura da resposta
interface PageResponse<T> {
  content: T[];           // Array de dados
  totalElements: number;  // Total de elementos
  totalPages: number;     // Total de páginas
  size: number;           // Tamanho da página
  number: number;         // Página atual (0-indexed)
  first: boolean;         // É a primeira página?
  last: boolean;          // É a última página?
  numberOfElements: number; // Elementos nesta página
  empty: boolean;         // Está vazia?
}
```

## Endpoints Esperados no Backend

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter dados do usuário logado
- `POST /api/auth/validate` - Validar token

### Oficina - Ordem de Serviço (PAGINADO)
- `GET /api/oficina/ordem-servico?page=0&size=10&sort=campo,asc` - Listar todas (paginado)
  - Query params: `page` (número da página, 0-indexed), `size` (itens por página), `sort` (ordenação opcional)
  - Retorna: `PageResponse<OrdemServicoAPI>`
- `GET /api/oficina/ordem-servico/{id}` - Buscar por ID
- `POST /api/oficina/ordem-servico` - Criar
- `PUT /api/oficina/ordem-servico/{id}` - Atualizar
- `PUT /api/oficina/ordem-servico/{id}/status` - Atualizar status
- `DELETE /api/oficina/ordem-servico/{id}` - Deletar

### Oficina - Clientes (PAGINADO)
- `GET /api/oficina/clientes?page=0&size=10&sort=nome,asc` - Listar todos (paginado)
- `GET /api/oficina/clientes/{id}` - Buscar por ID
- `POST /api/oficina/clientes` - Criar
- `PUT /api/oficina/clientes/{id}` - Atualizar
- `DELETE /api/oficina/clientes/{id}` - Deletar

### Oficina - Funcionários (PAGINADO)
- `GET /api/oficina/funcionarios?page=0&size=10&sort=nome,asc` - Listar todos (paginado)
- `GET /api/oficina/funcionarios/{id}` - Buscar por ID
- `POST /api/oficina/funcionarios` - Criar
- `PUT /api/oficina/funcionarios/{id}` - Atualizar
- `DELETE /api/oficina/funcionarios/{id}` - Deletar

### Oficina - Serviços (PAGINADO)
- `GET /api/oficina/servicos?page=0&size=10&sort=nome,asc` - Listar todos (paginado)
- `GET /api/oficina/servicos/{id}` - Buscar por ID
- `POST /api/oficina/servicos` - Criar
- `PUT /api/oficina/servicos/{id}` - Atualizar
- `DELETE /api/oficina/servicos/{id}` - Deletar

### Oficina - Financeiro
- `GET /api/oficina/financeiro/contas-bancarias` - Listar contas bancárias (geralmente não paginado)
- `POST /api/oficina/financeiro/contas-bancarias` - Criar conta bancária
- `PUT /api/oficina/financeiro/contas-bancarias/{id}` - Atualizar conta bancária
- `DELETE /api/oficina/financeiro/contas-bancarias/{id}` - Deletar conta bancária
- `GET /api/oficina/financeiro/contas-pagar?page=0&size=10` - Listar contas a pagar (PAGINADO)
- `POST /api/oficina/financeiro/contas-pagar` - Criar conta a pagar
- `PUT /api/oficina/financeiro/contas-pagar/{id}` - Atualizar conta a pagar
- `DELETE /api/oficina/financeiro/contas-pagar/{id}` - Deletar conta a pagar
- `GET /api/oficina/financeiro/contas-receber?page=0&size=10` - Listar contas a receber (PAGINADO)
- `POST /api/oficina/financeiro/contas-receber` - Criar conta a receber
- `PUT /api/oficina/financeiro/contas-receber/{id}` - Atualizar conta a receber
- `DELETE /api/oficina/financeiro/contas-receber/{id}` - Deletar conta a receber

## Headers

Todas as requisições (exceto `/auth/login`) incluem automaticamente:

- `Authorization: Bearer {token}` - Token JWT do usuário autenticado
- `X-Empresa-Id: {empresaId}` - ID da empresa do usuário (header customizado)
- `Content-Type: application/json`

O backend Java deve ler o `X-Empresa-Id` do header para filtrar os dados por empresa.

## Dados Mockados

Todos os dados mockados foram comentados em:

- `lib/auth.ts` - Usuários e senhas mockadas
- `lib/api.ts` - Dados mockados de exemplo

Os dados mockados podem ser descomentados apenas para desenvolvimento sem backend, mas **NÃO** devem ser usados em produção.

## Migração de localStorage para API

Arquivos que ainda usam `localStorage` precisam ser migrados para usar os serviços:

- `app/oficina/ordem-servico/page.tsx`
- `app/oficina/clientes/page.tsx`
- `app/oficina/funcionarios/page.tsx`
- `app/oficina/financeiro/page.tsx`
- `app/oficina/servicos/page.tsx`
- `app/oficina/configuracoes/page.tsx`

Para migrar, substitua:
- `localStorage.getItem()` → `servicoService.getAll(api)`
- `localStorage.setItem()` → `servicoService.create(api, data)` ou `servicoService.update(api, id, data)`
- `localStorage.removeItem()` → `servicoService.delete(api, id)`

