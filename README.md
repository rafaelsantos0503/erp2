# ERP Modular - Sistema Multi-Módulos

Sistema ERP modular moderno criado com Next.js 16, TypeScript, Tailwind CSS e componentes UI modernos. Suporta múltiplas aplicações (módulos) dentro do mesmo sistema com arquitetura multi-tenant.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização moderna
- **Lucide React** - Ícones
- **shadcn/ui pattern** - Componentes reutilizáveis
- **ViaCEP API** - Integração de endereços

## 📦 Estrutura do Projeto

```
erp/
├── app/
│   ├── layout.tsx              # Layout raiz com EmpresaProvider
│   ├── page.tsx                # Página de seleção de módulos
│   ├── globals.css             # Estilos globais
│   └── (modules)/              # Módulos do sistema
│       ├── corrida/           # Módulo Corrida (Eventos Esportivos)
│       │   ├── layout.tsx
│       │   ├── page.tsx       # Dashboard
│       │   ├── eventos/
│       │   ├── atletas/
│       │   ├── inscricoes/
│       │   ├── resultados/
│       │   ├── relatorios/
│       │   └── configuracoes/
│       └── oficina/            # Módulo Oficina (Oficinas Mecânicas)
│           ├── layout.tsx
│           ├── page.tsx       # Dashboard
│           ├── ordem-servico/ # Gestão de ordens de serviço
│           ├── clientes/      # Cadastro de clientes
│           ├── funcionarios/  # Gestão de funcionários
│           ├── configuracoes/ # Configurações (marcas/modelos)
│           ├── relatorios/    # Relatórios e análises
│           └── types.ts       # Tipos TypeScript do módulo
├── components/
│   ├── sidebar.tsx             # Sidebar dinâmico por módulo
│   ├── header.tsx             # Cabeçalho
│   ├── dashboard-stats.tsx    # Cards de estatísticas
│   └── ui/                     # Componentes UI base
│       ├── button.tsx
│       ├── card.tsx
│       └── modal.tsx
└── lib/
    ├── utils.ts                # Utilitários
    ├── empresa-context.tsx     # Context para multi-tenancy
    ├── api.ts                  # Hook para API calls
    └── README.md               # Documentação multi-tenant
```

## 🎨 Recursos

### Sistema Modular
- ✅ **Multi-módulos**: Suporte a múltiplas aplicações dentro do mesmo sistema
- ✅ **Multi-tenant**: Arquitetura preparada para múltiplas empresas
- ✅ **Módulo Corrida**: Sistema completo para gestão de eventos esportivos
- ✅ **Módulo Oficina**: Sistema completo para oficinas mecânicas

### Módulo Corrida
- ✅ **Dashboard**: Visão geral com estatísticas de eventos
- ✅ **Eventos**: Gerenciamento de corridas e eventos
- ✅ **Atletas**: Cadastro e gestão de atletas
- ✅ **Resultados**: Registro e publicação de resultados
- ✅ **Relatórios**: Métricas e análises
- ✅ **Configurações**: Customização do módulo

### Módulo Oficina
- ✅ **Dashboard**: Visão geral com métricas de produção
- ✅ **Ordens de Serviço**: Gestão completa de OS com itens de serviço
- ✅ **Clientes**: Cadastro com endereço ViaCEP e veículos
- ✅ **Funcionários**: Gestão de mecânicos e equipe
- ✅ **Veículos**: Cadastro de marcas e modelos
- ✅ **Relatórios**: Análises e métricas financeiras
- ✅ **Configurações**: Gestão de marcas e modelos de veículos

### Design e Arquitetura
- ✅ Design SaaS moderno e responsivo
- ✅ Sidebar dinâmica por módulo (colapsável)
- ✅ Tema claro/escuro pronto
- ✅ Componentes reutilizáveis
- ✅ TypeScript completo
- ✅ Integração ViaCEP para endereços
- ✅ Formulários com validação
- ✅ Modais para operações rápidas

## 🛠️ Como usar

### Instalar dependências
```bash
npm install
```

### Executar em desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Build para produção
```bash
npm run build
npm start
```

## 📄 Módulos e Páginas

### Módulo Corrida (`/corrida`)
- **Dashboard** - Visão geral com estatísticas de eventos
- **Eventos** - Gestão de corridas e eventos
- **Atletas** - Cadastro e gestão de atletas
- **Inscrições** - Controle de inscrições
- **Resultados** - Publicação de resultados
- **Relatórios** - Análises e métricas
- **Configurações** - Configurações do módulo

### Módulo Oficina (`/oficina`)
- **Dashboard** - Visão geral com estatísticas de produção
- **Ordem de Serviço** - Gestão completa de OS
- **Clientes** - Cadastro com endereço e veículos
- **Funcionários** - Gestão de equipe (mecânicos, recepcionistas, etc)
- **Financeiro** - Controle financeiro
- **Relatórios** - Análises e métricas financeiras
- **Configurações** - Gestão de marcas e modelos de veículos

## 🎨 Customização

O tema usa variáveis CSS em `app/globals.css`. Você pode customizar as cores editando as variáveis:

- `--primary`: Cor primária do sistema
- `--background`: Cor de fundo
- `--foreground`: Cor do texto
- `--border`: Cor das bordas

## 🔐 Arquitetura Multi-Tenant

O sistema está preparado para suportar múltiplas empresas (multi-tenant):

- **EmpresaProvider**: Context global para gerenciar empresaId
- **useApi**: Hook que automaticamente inclui empresaId em todas as chamadas API
- **Isolamento de Dados**: Cada empresa vê apenas seus próprios dados

Veja mais detalhes em `lib/README.md`

## 📚 Próximos Passos

### Módulo Corrida
1. ✅ Estrutura base completa
2. Integrar API backend para eventos e atletas
3. Sistema de inscrições online
4. Publicação de resultados
5. Sistema de notificações

### Módulo Oficina
1. ✅ Estrutura base completa
2. ✅ Gestão de clientes com endereço ViaCEP
3. ✅ Gestão de veículos (marcas/modelos)
4. ✅ Gestão de funcionários
5. ✅ Ordens de serviço completas
6. Integrar API backend (Java + MongoDB)
7. Sistema financeiro completo
8. Relatórios avançados

### Melhorias Gerais
1. Dark mode toggle funcional
2. Gráficos interativos
3. Exportação de relatórios em PDF
4. Notificações em tempo real
5. Autenticação e autorização
6. Configurações globais por empresa

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
