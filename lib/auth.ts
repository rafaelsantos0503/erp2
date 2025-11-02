/**
 * Utilitários de autenticação e usuários mocados
 * TODO: Substituir por chamadas reais ao backend quando implementado
 */

export type Modulo = 1 | 2 | 3; // 1 = SuperAdmin, 2 = Corrida, 3 = Oficina

export interface Usuario {
  id: string;
  username: string;
  passwordHash: string; // Hash da senha (no backend real seria bcrypt)
  empresaId: string;
  modulo: Modulo;
  nome: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    username: string;
    empresaId: string;
    modulo: Modulo;
    nome: string;
  };
}

// ============================================
// DADOS MOCKADOS - COMENTADOS PARA INTEGRAÇÃO COM BACKEND
// ============================================
// Usuários mocados para desenvolvimento
// Senhas: todas são "senha123" (no backend real seriam hasheadas com bcrypt)
/*
const USUARIOS_MOCADOS: Usuario[] = [
  {
    id: "1",
    username: "superadmin",
    passwordHash: "$2a$10$rOzJqMqQqQqQqQqQqQqQquqQqQqQqQqQqQqQqQqQqQqQqQqQ", // senha123 (hash mockado)
    empresaId: "empresa-admin-001",
    modulo: 1,
    nome: "Super Administrador",
  },
  {
    id: "2",
    username: "corrida",
    passwordHash: "$2a$10$rOzJqMqQqQqQqQqQqQqQquqQqQqQqQqQqQqQqQqQqQqQqQqQ", // senha123
    empresaId: "empresa-corrida-001",
    modulo: 2,
    nome: "Usuário Corrida",
  },
  {
    id: "3",
    username: "oficina",
    passwordHash: "$2a$10$rOzJqMqQqQqQqQqQqQqQquqQqQqQqQqQqQqQqQqQqQqQqQqQ", // senha123
    empresaId: "empresa-oficina-001",
    modulo: 3,
    nome: "Usuário Oficina",
  },
];

// Senhas em texto plano para validação mockada
// No backend real, a senha seria comparada com o hash usando bcrypt
const SENHAS_PLAIN_TEXT: Record<string, string> = {
  superadmin: "senha123",
  corrida: "senha123",
  oficina: "senha123",
};
*/

/**
 * Faz login no backend Java
 * Chama o endpoint POST /api/auth/login
 */
export async function fazerLogin(
  username: string,
  password: string
): Promise<LoginResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro no login: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao conectar com backend:", error);
    throw new Error("Não foi possível conectar com o servidor. Verifique se o backend está rodando.");
  }
}

/**
 * Login mockado para desenvolvimento quando backend não está disponível
 * COMENTADO - Usar apenas em caso de emergência ou desenvolvimento sem backend
 */
async function fazerLoginMock(
  username: string,
  password: string
): Promise<LoginResponse | null> {
  // ============================================
  // FALLBACK MOCKADO - APENAS PARA DESENVOLVIMENTO
  // ============================================
  /*
  // Simula delay de rede
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Busca o usuário
  const usuario = USUARIOS_MOCADOS.find((u) => u.username === username);

  if (!usuario) {
    return null;
  }

  // Valida a senha (mockado - no backend real seria bcrypt.compare)
  const senhaCorreta = SENHAS_PLAIN_TEXT[username] === password;

  if (!senhaCorreta) {
    return null;
  }

  // Gera um token mockado (no backend real seria um JWT)
  const token = `mock_token_${usuario.id}_${Date.now()}`;

  return {
    token,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      empresaId: usuario.empresaId,
      modulo: usuario.modulo,
      nome: usuario.nome,
    },
  };
  */
  
  // Retorna null quando backend não disponível (não usa mais dados mockados)
  return null;
}

/**
 * Valida um token no backend ou usa mock
 */
export async function validarToken(token: string): Promise<boolean> {
  // Valida token no backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  try {
    const response = await fetch(`${apiUrl}/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Erro ao validar token:", error);
    return false;
  }
}

/**
 * Decodifica o token para obter informações do usuário
 * NOTA: Para JWT real, use uma biblioteca como jwt-decode no frontend
 * OU sempre chame o backend para obter dados do usuário
 */
export function decodificarToken(token: string): { usuarioId: string } | null {
  // Para JWT real, você pode usar jwt-decode aqui
  // Por segurança, preferimos buscar dados do backend via obterUsuarioDoToken
  return null;
}

/**
 * Obtém informações do usuário a partir do token
 * Busca dados do backend via endpoint /auth/me
 * Retorna null se token inválido/expirado, lança erro se for problema de rede
 */
export async function obterUsuarioDoToken(token: string): Promise<Usuario | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  try {
    const response = await fetch(`${apiUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Se for 401, token está inválido/expirado
      if (response.status === 401) {
        return null;
      }
      // Outros erros HTTP - lança para indicar problema de servidor
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Se for erro de rede (fetch failed), relança para distinguir de token inválido
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Erro de rede - backend não está acessível
      throw error;
    }
    // Outros erros também relança
    throw error;
  }
}

