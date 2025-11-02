# Arquitetura Multi-Tenant

## Visão Geral

Este sistema ERP foi desenvolvido com arquitetura multi-tenant, onde cada empresa terá acesso isolado ao seu próprio módulo e dados.

## Componentes

### `empresa-context.tsx`
Contexto global que gerencia o ID da empresa atual. Por enquanto usa um ID mockado (`empresa-mock-001`) armazenado no localStorage.

**Quando tiver backend:**
- O `empresaId` virá da autenticação do usuário
- Será obtido do token JWT ou sessão
- Cada usuário pertence a uma empresa específica

### `api.ts`
Helper para fazer chamadas à API sempre incluindo o `empresaId`.

**Padrão de Endpoints:**
```
GET    /api/oficina/ordens-servico?empresaId={empresaId}
POST   /api/oficina/ordens-servico?empresaId={empresaId}
PUT    /api/oficina/ordens-servico/{id}?empresaId={empresaId}
DELETE /api/oficina/ordens-servico/{id}?empresaId={empresaId}
```

**Uso:**
```typescript
import { useApi } from "@/lib/api";

function MyComponent() {
  const { get, post, empresaId } = useApi();
  
  // GET com empresaId automático
  const ordens = await get("/oficina/ordens-servico");
  
  // POST com empresaId automático
  const novaOrdem = await post("/oficina/ordens-servico", {
    cliente: "João Silva",
    veiculo: "Civic 2020",
    // ...
  });
}
```

## Backend Futuro (Java + MongoDB)

### Estrutura do Banco
```javascript
// Coleção: empresas
{
  "_id": "empresa-001",
  "nome": "Oficina São Paulo",
  "cnpj": "12345678000190",
  "modulos": ["oficina"],
  "ativo": true,
  "createdAt": "2025-03-01T00:00:00Z"
}

// Coleção: usuarios
{
  "_id": "user-001",
  "empresaId": "empresa-001",
  "nome": "João Silva",
  "email": "joao@oficinasp.com",
  "modulo": "oficina",
  "role": "admin",
  "ativo": true
}

// Coleção: ordens_servico
{
  "_id": "os-001",
  "empresaId": "empresa-001",  // ← SEMPRE FILTRADO POR ISSO
  "numero": "OS-001",
  "cliente": "Maria Santos",
  "veiculo": "Corolla 2019",
  "status": "Em Andamento",
  "valorTotal": 320.00
}
```

### Filtragem Automática
No backend, todas as queries devem sempre incluir filtro por `empresaId`:

```java
// Exemplo (Spring Boot + MongoDB)
@GetMapping("/ordens-servico")
public List<OrdemServico> listarOrdens(@RequestParam String empresaId) {
    return ordemServicoRepository.findByEmpresaId(empresaId);
}
```

## Isolamento de Dados

**IMPORTANTE:** Nunca devolver dados de outras empresas. Sempre validar:
1. Token do usuário contém `empresaId` correto
2. Query MongoDB sempre filtra por `empresaId`
3. Validações server-side são obrigatórias

## Módulos

Cada empresa pode ter acesso a um ou mais módulos:
- `oficina` - Oficina mecânica
- `corrida` - Eventos de corrida

Um usuário só vê e acessa os módulos da sua empresa.

## Desenvolvimento

Atualmente, o sistema usa dados mockados. Quando implementar o backend:
1. Substituir `mockData` em `lib/api.ts`
2. Adicionar variável `NEXT_PUBLIC_API_URL` no `.env`
3. Implementar autenticação JWT
4. Conectar com MongoDB
5. Implementar endpoints REST em Java

## Segurança

- ✅ Validação server-side obrigatória
- ✅ Filtros por empresa no banco de dados
- ✅ Tokens JWT com empresaId
- ✅ Rate limiting por empresa
- ✅ CORS configurado apenas para origem permitida

