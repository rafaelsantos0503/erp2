# ERP Modular - Sistema Multi-Módulos

Sistema ERP modular moderno criado com Next.js 16, TypeScript, Tailwind CSS e componentes UI modernos. Suporta múltiplas aplicações (módulos) dentro do mesmo sistema.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização moderna
- **Lucide React** - Ícones
- **shadcn/ui pattern** - Componentes reutilizáveis

## 📦 Estrutura do Projeto

```
erp/
├── app/
│   ├── layout.tsx              # Layout raiz
│   ├── page.tsx                # Página de seleção de módulos
│   ├── globals.css             # Estilos globais
│   └── (modules)/              # Módulos do sistema
│       ├── corrida/           # Módulo Corrida (Delivery/Transportes)
│       │   ├── layout.tsx
│       │   ├── page.tsx       # Dashboard
│       │   ├── pedidos/
│       │   ├── entregadores/
│       │   ├── clientes/
│       │   ├── rotas/
│       │   ├── relatorios/
│       │   └── configuracoes/
│       ├── mercado/            # Módulo Mercado (Em breve)
│       └── office/             # Módulo Office (Em breve)
├── components/
│   ├── sidebar.tsx             # Sidebar dinâmico por módulo
│   ├── header.tsx             # Cabeçalho
│   ├── dashboard-stats.tsx    # Cards de estatísticas
│   └── ui/                     # Componentes UI base
│       ├── button.tsx
│       └── card.tsx
└── lib/
    └── utils.ts                # Utilitários
```

## 🎨 Recursos

### Sistema Modular
- ✅ **Multi-módulos**: Suporte a múltiplas aplicações dentro do mesmo sistema
- ✅ **Módulo Corrida**: Sistema completo para delivery e transportes
- ✅ **Módulos futuros**: Mercado, Office e outros em desenvolvimento

### Módulo Corrida
- ✅ **Dashboard**: Visão geral com estatísticas e entregas recentes
- ✅ **Pedidos**: Gerenciamento completo de pedidos e entregas
- ✅ **Entregadores**: Cadastro e gestão de entregadores
- ✅ **Clientes**: Gerenciamento de clientes com histórico
- ✅ **Rotas**: Planejamento e otimização de rotas
- ✅ **Relatórios**: Métricas e análises de performance
- ✅ **Configurações**: Customização do módulo

### Design
- ✅ Design SaaS moderno e responsivo
- ✅ Sidebar dinâmica por módulo
- ✅ Tema claro/escuro pronto
- ✅ Componentes reutilizáveis
- ✅ TypeScript completo

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
- **Dashboard** - Visão geral com estatísticas
- **Pedidos** - Gestão de pedidos e entregas
- **Entregadores** - Cadastro e status de entregadores
- **Clientes** - Gerenciamento de clientes
- **Rotas** - Planejamento de rotas
- **Relatórios** - Análises e métricas
- **Configurações** - Configurações do módulo

## 🎨 Customização

O tema usa variáveis CSS em `app/globals.css`. Você pode customizar as cores editando as variáveis:

- `--primary`: Cor primária do sistema
- `--background`: Cor de fundo
- `--foreground`: Cor do texto
- `--border`: Cor das bordas

## 📚 Próximos Passos

### Módulo Corrida
1. ✅ Estrutura base completa
2. Integrar API backend para pedidos
3. Adicionar mapa e rastreamento em tempo real
4. Sistema de notificações push
5. Integração com GPS para entregadores

### Novos Módulos
1. Desenvolver módulo Mercado (gestão de supermercado)
2. Desenvolver módulo Office (gestão de escritório)
3. Adicionar autenticação e permissões por módulo
4. Sistema de configurações globais

### Melhorias Gerais
1. Dark mode toggle funcional
2. Gráficos interativos
3. Exportação de relatórios em PDF
4. Notificações em tempo real

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
