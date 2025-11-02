# Configuração de Variáveis de Ambiente

## Ambiente Local

Para desenvolvimento local, crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_ENV=local
```

## Ambiente de Produção

Para produção, configure as variáveis de ambiente no seu provedor de hospedagem:

- **Vercel**: Vá em Settings > Environment Variables
- **Netlify**: Vá em Site settings > Environment variables

Configure:
```env
NEXT_PUBLIC_API_URL=https://seu-backend-producao.com/api
NEXT_PUBLIC_ENV=production
```

## Variáveis Disponíveis

- `NEXT_PUBLIC_API_URL`: URL completa do backend API (ex: `http://localhost:8080/api`)
- `NEXT_PUBLIC_ENV`: Ambiente atual (`local` ou `production`)

## Nota

- Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente (browser)
- Após criar/modificar `.env.local`, reinicie o servidor de desenvolvimento (`npm run dev`)

