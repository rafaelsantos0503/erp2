"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ClipboardCheck, Plus, Wrench, AlertCircle, CheckCircle, Clock, DollarSign, Trash2, Edit2, Eye, Car, ChevronLeft, ChevronRight } from "lucide-react";
import type { Cliente, VeiculoCliente } from "../clientes/page";
import type { Marca, Modelo, Funcionario } from "../types";
import type { Servico } from "../servicos/page";
import { calcularValorEstimadoServico, calcularCustoMedioAtendimento, type ConfiguracoesFinanceiras } from "../utils";
import type { ClienteAPI } from "@/lib/services/cliente.service";
import type { FuncionarioAPI } from "@/lib/services/funcionario.service";
import type { ServicoAPI } from "@/lib/services/servico.service";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ordemServicoService, type OrdemServicoAPI } from "@/lib/services/ordem-servico.service";
import { financeiroService } from "@/lib/services/financeiro.service";
import { clienteService } from "@/lib/services/cliente.service";
import { funcionarioService } from "@/lib/services/funcionario.service";
import { servicoService } from "@/lib/services/servico.service";

export enum StatusOrdemServico {
  ORCAMENTO = "Orçamento",
  EM_ANDAMENTO = "Em Andamento",
  AGUARDANDO_PECAS = "Aguardando Peças",
  FINALIZADO = "Finalizado",
  CANCELADO = "Cancelado"
}

export enum Prioridade {
  BAIXA = "Baixa",
  MEDIA = "Média",
  ALTA = "Alta"
}

interface ItemServico {
  id: number;
  servicoId?: number; // ID do serviço cadastrado (opcional)
  descricao: string;
  quantidade: string;
  valorUnitario: string;
  valorTotal: string;
  tempoEstimado?: number; // Tempo do serviço em horas
}

interface OrdemServico {
  id: number;
  numero: string;
  cliente: string;
  telefone: string;
  email: string;
  marcaVeiculo: string;
  modeloVeiculo: string;
  placa: string;
  ano: string;
  cor: string;
  descricaoProblema: string;
  prioridade: Prioridade;
  status: StatusOrdemServico;
  dataEntrada: string;
  dataPrevisao: string;
  mecanico: string;
  observacoes: string;
  valorTotal: number;
  itens?: ItemServico[];
}

export default function OrdemServicoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isModeloModalOpen, setIsModeloModalOpen] = useState(false);
  const [editingOrdemId, setEditingOrdemId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Dados carregados do backend
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]); // TODO: Criar serviço para marcas quando backend suportar
  const [modelos, setModelos] = useState<Modelo[]>([]); // TODO: Criar serviço para modelos quando backend suportar
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const mecanicos = funcionarios.filter(f => f.tipo === "Mecanico");

  // Configurações financeiras (normalmente viria do backend ou contexto)
  const [configuracoesFinanceiras] = useState<ConfiguracoesFinanceiras>({
    valoresOperacionais: [
      { id: 1, descricao: "Conta de Luz", valor: 500.00 },
      { id: 2, descricao: "Aluguel", valor: 2000.00 },
      { id: 3, descricao: "Água", valor: 150.00 },
      { id: 4, descricao: "Internet", valor: 100.00 },
      { id: 5, descricao: "Taxas Locais", valor: 250.00 },
    ],
    mediaAtendimentosMensais: 10,
    margemLucroPorAtendimento: 10,
  });
  
  const [formData, setFormData] = useState({
    cliente: "",
    telefone: "",
    email: "",
    marcaVeiculo: "",
    modeloVeiculo: "",
    placa: "",
    ano: "",
    cor: "",
    descricaoProblema: "",
    prioridade: Prioridade.BAIXA,
    mecanico: "",
    observacoes: "",
  });

  const [editFormData, setEditFormData] = useState({
    cliente: "",
    telefone: "",
    email: "",
    marcaVeiculo: "",
    modeloVeiculo: "",
    placa: "",
    ano: "",
    cor: "",
    descricaoProblema: "",
    prioridade: Prioridade.BAIXA,
    status: StatusOrdemServico.ORCAMENTO,
    mecanico: "",
    observacoes: "",
  });

  const [newCliente, setNewCliente] = useState({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
    veiculos: [] as VeiculoCliente[],
  });

  const [newVeiculosCliente, setNewVeiculosCliente] = useState<VeiculoCliente[]>([]);
  const [isNewVeiculoModalOpen, setIsNewVeiculoModalOpen] = useState(false);
  const [newVeiculoForm, setNewVeiculoForm] = useState<VeiculoCliente>({ id: 0, marca: "", modelo: "", placa: "", ano: "", cor: "" });

  const [newMarca, setNewMarca] = useState({
    nome: "",
  });

  const [newModelo, setNewModelo] = useState({
    marcaId: "",
    nome: "",
  });

  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [marcaSearchTerm, setMarcaSearchTerm] = useState("");
  const [modeloSearchTerm, setModeloSearchTerm] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showMarcaDropdown, setShowMarcaDropdown] = useState(false);
  const [showModeloDropdown, setShowModeloDropdown] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [isVeiculoClienteModalOpen, setIsVeiculoClienteModalOpen] = useState(false);
  const [newVeiculoCliente, setNewVeiculoCliente] = useState({
    marca: "",
    modelo: "",
    placa: "",
    ano: "",
    cor: "",
  });

  const [itens, setItens] = useState<ItemServico[]>([
    { id: 1, descricao: "", quantidade: "", valorUnitario: "", valorTotal: "" },
  ]);

  const [editItens, setEditItens] = useState<ItemServico[]>([
    { id: 1, descricao: "", quantidade: "", valorUnitario: "", valorTotal: "" },
  ]);

  const api = useApi();
  const { empresaId } = api; // Extrai empresaId do api
  const { token } = useAuth(); // Pega token do contexto de auth
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [statusFiltro, setStatusFiltro] = useState<StatusOrdemServico | null>(null);
  const [paginaAtualBackend, setPaginaAtualBackend] = useState(0); // 0-indexed para backend
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalElementos, setTotalElementos] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  // Dados carregados do backend
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);

  // Funções de conversão entre API e frontend
  const converterAPIparaFrontend = (api: OrdemServicoAPI): OrdemServico => {
    return {
      id: api.id,
      numero: api.numero,
      cliente: api.cliente,
      telefone: api.telefone,
      email: api.email,
      marcaVeiculo: api.marcaVeiculo,
      modeloVeiculo: api.modeloVeiculo,
      placa: api.placa,
      ano: api.ano,
      cor: api.cor,
      descricaoProblema: api.descricaoProblema,
      prioridade: api.prioridade as Prioridade,
      status: api.status as StatusOrdemServico,
      dataEntrada: api.dataEntrada,
      dataPrevisao: api.dataPrevisao,
      mecanico: api.mecanico,
      observacoes: api.observacoes,
      valorTotal: api.valorTotal,
      itens: (api.itens || []).map(item => ({
        id: item.id,
        servicoId: item.servicoId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.valorTotal,
        tempoEstimado: item.tempoEstimado,
      })),
    };
  };

  const converterFrontendparaAPI = (ordem: OrdemServico): Omit<OrdemServicoAPI, "id" | "numero"> => {
    return {
      cliente: ordem.cliente,
      telefone: ordem.telefone,
      email: ordem.email,
      marcaVeiculo: ordem.marcaVeiculo,
      modeloVeiculo: ordem.modeloVeiculo,
      placa: ordem.placa,
      ano: ordem.ano,
      cor: ordem.cor,
      descricaoProblema: ordem.descricaoProblema,
      prioridade: ordem.prioridade as "Baixa" | "Média" | "Alta",
      status: ordem.status as "Orçamento" | "Em Andamento" | "Aguardando Peças" | "Finalizado" | "Cancelado",
      dataEntrada: ordem.dataEntrada,
      dataPrevisao: ordem.dataPrevisao,
      mecanico: ordem.mecanico,
      observacoes: ordem.observacoes,
      valorTotal: ordem.valorTotal,
      itens: (ordem.itens || []).map(item => ({
        id: item.id,
        servicoId: item.servicoId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.valorTotal,
        tempoEstimado: item.tempoEstimado,
      })),
    };
  };

  // Função para converter data DD/MM/YYYY para YYYY-MM-DD
  const converterDataParaISO = (data: string): string => {
    if (!data) {
      const hoje = new Date();
      return hoje.toISOString().split('T')[0];
    }
    try {
      const [dia, mes, ano] = data.split("/");
      return `${ano}-${mes}-${dia}`;
    } catch {
      const hoje = new Date();
      return hoje.toISOString().split('T')[0];
    }
  };

  // Função auxiliar para gerar conta a receber via API
  const gerarContaReceber = async (ordem: OrdemServico) => {
    // Não gerar conta se o valor total for zero ou negativo
    if (!ordem.valorTotal || ordem.valorTotal <= 0) return;

    try {
      // Verificar se já existe conta a receber para esta ordem
      const contas = await financeiroService.contasReceber.getAll(api, { page: 0, size: 100 });
      const contaExistente = contas.content.find((c) => c.ordemServicoId === ordem.id);
      if (contaExistente) return; // Já existe, não criar novamente

      const dataVencimento = converterDataParaISO(ordem.dataPrevisao);

      await financeiroService.contasReceber.create(api, {
        descricao: `Ordem de Serviço ${ordem.numero}`,
        cliente: ordem.cliente,
        valor: ordem.valorTotal,
        dataVencimento: dataVencimento,
        recebido: false,
        recorrencia: "NENHUMA",
        ordemServicoId: ordem.id,
        observacoes: `Gerado automaticamente da OS ${ordem.numero}`,
      });
    } catch (error) {
      console.error("Erro ao gerar conta a receber:", error);
    }
  };

  // Função auxiliar para excluir conta a receber via API
  const excluirContaReceber = async (ordemId: number) => {
    try {
      const contas = await financeiroService.contasReceber.getAll(api, { page: 0, size: 100 });
      const contaParaExcluir = contas.content.find((c) => c.ordemServicoId === ordemId);
      if (contaParaExcluir) {
        await financeiroService.contasReceber.delete(api, contaParaExcluir.id);
      }
    } catch (error) {
      console.error("Erro ao excluir conta a receber:", error);
    }
  };

  // Ref para evitar requisições simultâneas duplicadas
  const carregandoRef = useRef(false);

  // Carregar ordens do backend
  const carregarOrdens = async () => {
    // Evita requisições duplicadas simultâneas
    if (carregandoRef.current) {
      console.log("Requisição já em andamento, ignorando duplicata");
      return;
    }
    
    // Verifica se empresaId e token estão disponíveis antes de fazer a requisição
    if (!empresaId || !token) {
      console.warn("EmpresaId ou token não disponíveis, aguardando...", { empresaId, token: !!token });
      return;
    }

    carregandoRef.current = true;
    setCarregando(true);
    setErro(null);
    try {
      console.log("Carregando ordens...", { 
        page: paginaAtualBackend, 
        size: itensPorPagina, 
        empresaId,
        baseUrl: api.baseUrl,
        token: !!token,
      });

      const pagina = await ordemServicoService.getAll(api, {
        page: paginaAtualBackend,
        size: itensPorPagina,
        sort: "dataEntrada,desc",
      });
      
      console.log("Resposta recebida do backend:", pagina);
      
      // Verifica se a resposta tem a estrutura esperada
      if (!pagina) {
        console.error("Resposta do backend é null ou undefined");
        setErro("Resposta inválida do servidor.");
        return;
      }

      if (!pagina.content || !Array.isArray(pagina.content)) {
        console.error("Resposta do backend não tem estrutura esperada:", {
          temContent: !!pagina.content,
          isArray: Array.isArray(pagina.content),
          respostaCompleta: pagina
        });
        setErro("Formato de resposta inválido do servidor. Verifique o console para mais detalhes.");
        return;
      }

      console.log(`Convertendo ${pagina.content.length} ordens...`);
      const ordensConvertidas = pagina.content.map(converterAPIparaFrontend);
      
      // Aplicar filtro de status no frontend (quando o backend suportar, mover para query param)
      const ordensFiltradas = statusFiltro 
        ? ordensConvertidas.filter(os => os.status === statusFiltro)
        : ordensConvertidas;
      
      console.log(`Ordens carregadas: ${ordensFiltradas.length} (filtradas de ${ordensConvertidas.length} total)`);
      
      setOrdens(ordensFiltradas);
      setTotalElementos(pagina.totalElements || 0);
      setTotalPaginas(pagina.totalPages || 0);
    } catch (error) {
      console.error("Erro ao carregar ordens:", error);
      
      let errorMessage = "Erro desconhecido ao carregar ordens de serviço";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Log adicional para debug (stack pode não estar disponível em todos os casos)
        if (error.stack) {
          console.error("Stack trace:", error.stack);
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      setErro(errorMessage);
    } finally {
      setCarregando(false);
      carregandoRef.current = false;
    }
  };

  useEffect(() => {
    // Só carrega se empresaId e token estiverem disponíveis
    if (empresaId && token) {
      carregarOrdens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtualBackend, itensPorPagina, statusFiltro, empresaId, token]);

  // Função para carregar clientes sob demanda (quando necessário)
  const carregarClientes = async () => {
    if (!api.empresaId || !token || clientes.length > 0) return; // Já carregou
    
    try {
      const pagina = await clienteService.getAll(api, { page: 0, size: 1000 });
      // Converte ClienteAPI para Cliente
      const clientesConvertidos: Cliente[] = pagina.content.map((c: ClienteAPI) => ({
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        email: c.email,
        cpf: c.cpf,
        endereco: c.endereco,
        veiculos: (c.veiculos || []).map(v => ({
          id: v.id,
          marca: v.marca,
          modelo: v.modelo,
          placa: v.placa,
          ano: v.ano,
          cor: v.cor,
        })),
      }));
      setClientes(clientesConvertidos);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setClientes([]);
    }
  };

  // Função para carregar funcionários sob demanda (quando necessário)
  const carregarFuncionarios = async () => {
    if (!api.empresaId || !token || funcionarios.length > 0) return; // Já carregou
    
    try {
      const pagina = await funcionarioService.getAll(api, { page: 0, size: 1000 });
      // Converte FuncionarioAPI para Funcionario
      const funcionariosConvertidos: Funcionario[] = pagina.content.map((f: FuncionarioAPI) => ({
        id: f.id,
        nome: f.nome,
        telefone: f.telefone,
        email: f.email,
        tipo: f.tipo,
        tipoContratacao: f.tipoContratacao,
        valorDespesa: f.valorDespesa,
        cpf: f.cpf,
        dataAdmissao: f.dataAdmissao,
      }));
      setFuncionarios(funcionariosConvertidos);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      setFuncionarios([]);
    }
  };

  // Função para carregar serviços sob demanda (quando necessário)
  const carregarServicos = async () => {
    if (!api.empresaId || !token || servicos.length > 0) return; // Já carregou
    
    try {
      const pagina = await servicoService.getAll(api, { page: 0, size: 1000 });
      // Converte ServicoAPI para Servico
      const servicosConvertidos: Servico[] = pagina.content.map((s: ServicoAPI) => ({
        id: s.id,
        nome: s.nome,
        descricao: s.descricao,
        tempoEstimadoHoras: s.tempoEstimadoHoras,
        tipoAplicacao: s.tipoAplicacao,
        marcaId: s.marcaId,
        modeloId: s.modeloId,
      }));
      setServicos(servicosConvertidos);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      setServicos([]);
    }
  };

  // O useEffect acima já recarrega os dados automaticamente quando empresaId muda
  useEffect(() => {
    if (empresaId) {
      setPaginaAtualBackend(0);
    }
  }, [empresaId]);

  useEffect(() => {
    // Quando mudar o tamanho da página ou o filtro, voltar para página 0
    setPaginaAtualBackend(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itensPorPagina, statusFiltro]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Se mudou o funcionário, recalcula os itens que têm serviço selecionado
      if (field === "mecanico") {
        // Usa o novo valor do mecanico para recalcular
        const funcionarioSelecionado = mecanicos.find(m => m.nome === value);
        if (funcionarioSelecionado) {
          setTimeout(() => {
            setItens((prevItens) =>
              prevItens.map((item) => {
                if (item.servicoId && item.tempoEstimado) {
                  const servico = servicos.find(s => s.id === item.servicoId);
                  if (servico) {
                    const calculo = calcularValorEstimadoServico(
                      servico,
                      funcionarioSelecionado,
                      configuracoesFinanceiras
                    );
                    return {
                      ...item,
                      valorUnitario: calculo.valorTotal.toFixed(2),
                      valorTotal: (parseFloat(item.quantidade) || 1) * calculo.valorTotal,
                    };
                  }
                }
                return item;
              })
            );
          }, 0);
        }
      }
      
      return newData;
    });
  };

  const handleItemChange = (
    id: number,
    field: keyof ItemServico,
    value: string | number
  ) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Se selecionou um serviço, preenche automaticamente
          if (field === "servicoId") {
            if (value) {
              const servicoSelecionado = servicos.find(s => s.id === parseInt(value as string));
              if (servicoSelecionado) {
                updated.descricao = servicoSelecionado.nome;
                updated.tempoEstimado = servicoSelecionado.tempoEstimadoHoras;
                updated.quantidade = "1";
                
                // Calcula o valor se tiver funcionário selecionado
                // Usa formData.mecanico ou o mecanico que pode ter sido atualizado
                const mecanicoAtual = formData.mecanico;
                if (mecanicoAtual) {
                  const funcionarioSelecionado = mecanicos.find(m => m.nome === mecanicoAtual);
                  if (funcionarioSelecionado) {
                    const calculo = calcularValorEstimadoServico(
                      servicoSelecionado,
                      funcionarioSelecionado,
                      configuracoesFinanceiras
                    );
                    updated.valorUnitario = calculo.valorTotal.toFixed(2);
                    updated.valorTotal = calculo.valorTotal.toFixed(2);
                  }
                }
              }
            } else {
              // Se limpou o serviço, limpa também os campos relacionados
              updated.tempoEstimado = undefined;
              updated.valorUnitario = "";
              updated.valorTotal = "0.00";
            }
          }
          
          // Recalcula se mudou quantidade ou valor unitário manualmente
          if (field === "quantidade" || field === "valorUnitario") {
            const qtd = parseFloat(updated.quantidade) || 0;
            const valor = parseFloat(updated.valorUnitario) || 0;
            updated.valorTotal = (qtd * valor).toFixed(2);
          }
          
          return updated;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setItens((prev) => [
      ...prev,
      { id: prev.length + 1, descricao: "", quantidade: "", valorUnitario: "", valorTotal: "" },
    ]);
  };

  const removeItem = (id: number) => {
    if (itens.length > 1) {
      setItens((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Se mudou o funcionário, recalcula os itens que têm serviço selecionado
      if (field === "mecanico") {
        const funcionarioSelecionado = mecanicos.find(m => m.nome === value);
        if (funcionarioSelecionado) {
          setTimeout(() => {
            setEditItens((prevItens) =>
              prevItens.map((item) => {
                if (item.servicoId && item.tempoEstimado) {
                  const servico = servicos.find(s => s.id === item.servicoId);
                  if (servico) {
                    const calculo = calcularValorEstimadoServico(
                      servico,
                      funcionarioSelecionado,
                      configuracoesFinanceiras
                    );
                    return {
                      ...item,
                      valorUnitario: calculo.valorTotal.toFixed(2),
                      valorTotal: (parseFloat(item.quantidade) || 1) * calculo.valorTotal,
                    };
                  }
                }
                return item;
              })
            );
          }, 0);
        }
      }
      
      return newData;
    });
  };

  const handleEditItemChange = (
    id: number,
    field: keyof ItemServico,
    value: string | number
  ) => {
    setEditItens((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Se selecionou um serviço, preenche automaticamente
          if (field === "servicoId") {
            if (value) {
              const servicoSelecionado = servicos.find(s => s.id === parseInt(value as string));
              if (servicoSelecionado) {
                updated.descricao = servicoSelecionado.nome;
                updated.tempoEstimado = servicoSelecionado.tempoEstimadoHoras;
                updated.quantidade = "1";
                
                // Calcula o valor se tiver funcionário selecionado
                if (editFormData.mecanico) {
                  const funcionarioSelecionado = mecanicos.find(m => m.nome === editFormData.mecanico);
                  if (funcionarioSelecionado) {
                    const calculo = calcularValorEstimadoServico(
                      servicoSelecionado,
                      funcionarioSelecionado,
                      configuracoesFinanceiras
                    );
                    updated.valorUnitario = calculo.valorTotal.toFixed(2);
                    updated.valorTotal = calculo.valorTotal.toFixed(2);
                  }
                }
              }
            } else {
              // Se limpou o serviço, limpa também os campos relacionados
              updated.tempoEstimado = undefined;
              updated.valorUnitario = "";
              updated.valorTotal = "0.00";
            }
          }
          
          // Recalcula se mudou quantidade ou valor unitário manualmente
          if (field === "quantidade" || field === "valorUnitario") {
            const qtd = parseFloat(updated.quantidade) || 0;
            const valor = parseFloat(updated.valorUnitario) || 0;
            updated.valorTotal = (qtd * valor).toFixed(2);
          }
          
          return updated;
        }
        return item;
      })
    );
  };

  const addEditItem = () => {
    setEditItens((prev) => [
      ...prev,
      { id: prev.length + 1, descricao: "", quantidade: "", valorUnitario: "", valorTotal: "" },
    ]);
  };

  const removeEditItem = (id: number) => {
    if (editItens.length > 1) {
      setEditItens((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setFormData({
      ...formData,
      cliente: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      marcaVeiculo: "",
      modeloVeiculo: "",
      placa: "",
      ano: "",
      cor: "",
    });
    setClienteSearchTerm(cliente.nome);
    setSelectedClienteId(cliente.id);
    setShowClienteDropdown(false);
  };

  const handleMarcaSelect = (marca: Marca) => {
    setFormData({ ...formData, marcaVeiculo: marca.nome, modeloVeiculo: "" });
    setMarcaSearchTerm(marca.nome);
    setModeloSearchTerm("");
    setShowMarcaDropdown(false);
  };

  const handleModeloSelect = (modelo: Modelo) => {
    setFormData({ ...formData, modeloVeiculo: modelo.nome });
    setModeloSearchTerm(modelo.nome);
    setShowModeloDropdown(false);
  };

  const handleNewClienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = clientes.length + 1;
    const novoCliente: Cliente = {
      id: novoId,
      nome: newCliente.nome,
      telefone: newCliente.telefone,
      email: newCliente.email,
      cpf: newCliente.cpf || undefined,
      endereco: newCliente.endereco.cep ? newCliente.endereco : undefined,
      veiculos: newVeiculosCliente.length > 0 ? newVeiculosCliente : undefined,
    };
    setClientes([...clientes, novoCliente]);
    
    // Auto-select do cliente recém criado
    handleClienteSelect(novoCliente);
    
    setIsClienteModalOpen(false);
    setNewCliente({ nome: "", telefone: "", email: "", cpf: "", endereco: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }, veiculos: [] });
    setNewVeiculosCliente([]);
  };

  const handleNewClienteEnderecoChange = (field: string, value: string) => {
    setNewCliente((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
  };

  const handleNewClienteCepBlur = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setNewCliente((prev) => ({
          ...prev,
          endereco: {
            cep: data.cep,
            logradouro: data.logradouro || "",
            numero: prev.endereco?.numero || "",
            complemento: prev.endereco?.complemento || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
          },
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleAddNewVeiculo = () => {
    setMarcaSearchTerm("");
    setModeloSearchTerm("");
    setIsNewVeiculoModalOpen(true);
    setNewVeiculoForm({ id: 0, marca: "", modelo: "", placa: "", ano: "", cor: "" });
  };

  const handleSaveNewVeiculo = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = newVeiculosCliente.length > 0 ? Math.max(...newVeiculosCliente.map(v => v.id)) + 1 : 1;
    const novoVeiculo = { ...newVeiculoForm, id: novoId };
    setNewVeiculosCliente([...newVeiculosCliente, novoVeiculo]);
    setIsNewVeiculoModalOpen(false);
    setMarcaSearchTerm("");
    setModeloSearchTerm("");
  };

  const handleRemoveNewVeiculo = (id: number) => {
    setNewVeiculosCliente(newVeiculosCliente.filter(v => v.id !== id));
  };

  const getVeiculosDoCliente = (): VeiculoCliente[] => {
    if (!selectedClienteId) return [];
    const cliente = clientes.find(c => c.id === selectedClienteId);
    return cliente?.veiculos || [];
  };

  const handleVeiculoClienteSelect = (veiculo: VeiculoCliente) => {
    setFormData({
      ...formData,
      marcaVeiculo: veiculo.marca,
      modeloVeiculo: veiculo.modelo,
      placa: veiculo.placa,
      ano: veiculo.ano || "",
      cor: veiculo.cor || "",
    });
    setModeloSearchTerm(`${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`);
    setShowModeloDropdown(false);
  };

  const handleNewVeiculoClienteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClienteId) return;
    
    const veiculoId = getVeiculosDoCliente().length > 0 
      ? Math.max(...getVeiculosDoCliente().map(v => v.id)) + 1 
      : 1;
    
    const novoVeiculo: VeiculoCliente = {
      id: veiculoId,
      marca: newVeiculoCliente.marca,
      modelo: newVeiculoCliente.modelo,
      placa: newVeiculoCliente.placa,
      ano: newVeiculoCliente.ano,
      cor: newVeiculoCliente.cor,
    };

    setClientes(clientes.map(c => {
      if (c.id === selectedClienteId) {
        return {
          ...c,
          veiculos: [...(c.veiculos || []), novoVeiculo]
        };
      }
      return c;
    }));

    handleVeiculoClienteSelect(novoVeiculo);
    setIsVeiculoClienteModalOpen(false);
    setNewVeiculoCliente({ marca: "", modelo: "", placa: "", ano: "", cor: "" });
  };

  const handleOpenVeiculoClienteModal = () => {
    const marcaSelecionada = marcas.find(m => m.nome === formData.marcaVeiculo);
    if (marcaSelecionada) {
      setNewVeiculoCliente({ marca: marcaSelecionada.nome, modelo: "", placa: "", ano: "", cor: "" });
    } else {
      setNewVeiculoCliente({ marca: "", modelo: "", placa: "", ano: "", cor: "" });
    }
    setIsVeiculoClienteModalOpen(true);
  };

  const handleNewMarcaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = marcas.length + 1;
    const novaMarca: Marca = {
      id: novoId,
      nome: newMarca.nome,
    };
    setMarcas([...marcas, novaMarca]);
    
    // Auto-select da marca recém criada
    handleMarcaSelect(novaMarca);
    
    setIsMarcaModalOpen(false);
    setNewMarca({ nome: "" });
  };

  const handleNewModeloSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = modelos.length + 1;
    const novoModelo: Modelo = {
      id: novoId,
      marcaId: parseInt(newModelo.marcaId),
      nome: newModelo.nome,
    };
    setModelos([...modelos, novoModelo]);
    
    // Auto-select do modelo recém criado
    handleModeloSelect(novoModelo);
    
    setIsModeloModalOpen(false);
    setNewModelo({ marcaId: "", nome: "" });
  };

  const handleOpenModeloModal = () => {
    const marcaSelecionada = marcas.find(m => m.nome === formData.marcaVeiculo);
    if (marcaSelecionada) {
      setNewModelo({ marcaId: marcaSelecionada.id.toString(), nome: "" });
    } else {
      setNewModelo({ marcaId: "", nome: "" });
    }
    setIsModeloModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    const valorTotal = itens.reduce((sum, item) => {
      const qtd = parseFloat(item.quantidade) || 0;
      const valor = parseFloat(item.valorUnitario) || 0;
      return sum + (qtd * valor);
    }, 0);

    const novaOrdem: OrdemServico = {
        id: 0, // Será definido pelo backend
        numero: "", // Será gerado pelo backend
      cliente: formData.cliente,
      telefone: formData.telefone,
      email: formData.email,
      marcaVeiculo: formData.marcaVeiculo,
      modeloVeiculo: formData.modeloVeiculo,
      placa: formData.placa,
      ano: formData.ano,
      cor: formData.cor,
      descricaoProblema: formData.descricaoProblema,
      prioridade: formData.prioridade as Prioridade,
        status: StatusOrdemServico.ORCAMENTO, // Novas ordens sempre começam como Orçamento
      dataEntrada: hoje,
      dataPrevisao: "",
      mecanico: formData.mecanico,
      observacoes: formData.observacoes,
      valorTotal: valorTotal,
      itens: itens.filter(item => item.descricao && item.quantidade && item.valorUnitario)
    };

      const dadosAPI = converterFrontendparaAPI(novaOrdem);
      await ordemServicoService.create(api, dadosAPI);

      // Recarregar lista
      await carregarOrdens();

    setIsModalOpen(false);
    setFormData({
      cliente: "",
      telefone: "",
      email: "",
      marcaVeiculo: "",
      modeloVeiculo: "",
      placa: "",
      ano: "",
      cor: "",
      descricaoProblema: "",
      prioridade: Prioridade.BAIXA,
      mecanico: "",
      observacoes: "",
    });
    setClienteSearchTerm("");
    setMarcaSearchTerm("");
    setModeloSearchTerm("");
    setSelectedClienteId(null);
    setItens([{ id: 1, descricao: "", quantidade: "", valorUnitario: "", valorTotal: "" }]);
    } catch (error) {
      console.error("Erro ao criar ordem:", error);
      setErro("Erro ao criar ordem de serviço. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrdemId) return;

    setCarregando(true);
    setErro(null);

    try {
      const ordemOriginal = ordens.find(os => os.id === editingOrdemId);
      if (!ordemOriginal) return;

    const valorTotal = editItens.reduce((sum, item) => {
      const qtd = parseFloat(item.quantidade) || 0;
      const valor = parseFloat(item.valorUnitario) || 0;
      return sum + (qtd * valor);
    }, 0);

      const novoStatus = editFormData.status as StatusOrdemServico;
      const statusMudou = ordemOriginal.status !== novoStatus;

    const ordemAtualizada: OrdemServico = {
        ...ordemOriginal,
      cliente: editFormData.cliente,
      telefone: editFormData.telefone,
      email: editFormData.email,
      marcaVeiculo: editFormData.marcaVeiculo,
      modeloVeiculo: editFormData.modeloVeiculo,
      placa: editFormData.placa,
      ano: editFormData.ano,
      cor: editFormData.cor,
      descricaoProblema: editFormData.descricaoProblema,
      prioridade: editFormData.prioridade as Prioridade,
        status: novoStatus,
      mecanico: editFormData.mecanico,
      observacoes: editFormData.observacoes,
      valorTotal: valorTotal,
      itens: editItens.filter(item => item.descricao && item.quantidade && item.valorUnitario)
    };

      const dadosAPI = converterFrontendparaAPI(ordemAtualizada);
      await ordemServicoService.update(api, editingOrdemId, dadosAPI);

      // Se o status mudou, verificar se precisa gerar ou excluir conta a receber
      if (statusMudou) {
        // Se estava em "Orçamento" e mudou para outro status (exceto Cancelado), gerar conta a receber
        if (ordemOriginal.status === StatusOrdemServico.ORCAMENTO && novoStatus !== StatusOrdemServico.ORCAMENTO && novoStatus !== StatusOrdemServico.CANCELADO && valorTotal > 0) {
          await gerarContaReceber(ordemAtualizada);
        }

        // Se mudou para "Cancelado", excluir a conta a receber relacionada
        if (novoStatus === StatusOrdemServico.CANCELADO) {
          await excluirContaReceber(editingOrdemId);
        }
      }

      // Recarregar lista
      await carregarOrdens();

    setIsEditModalOpen(false);
    setEditingOrdemId(null);
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      setErro("Erro ao atualizar ordem de serviço. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const alterarStatusOrdemServico = async (ordemId: number, novoStatus: StatusOrdemServico) => {
    setCarregando(true);
    setErro(null);

    try {
      const ordemAtual = ordens.find((ordem) => ordem.id === ordemId);
      if (!ordemAtual) return;

      // Atualizar status no backend
      await ordemServicoService.updateStatus(api, ordemId, novoStatus as "Orçamento" | "Em Andamento" | "Aguardando Peças" | "Finalizado" | "Cancelado");

      // Se estava em "Orçamento" e mudou para outro status (exceto Cancelado), gerar conta a receber
      if (ordemAtual.status === StatusOrdemServico.ORCAMENTO && novoStatus !== StatusOrdemServico.ORCAMENTO && novoStatus !== StatusOrdemServico.CANCELADO && ordemAtual.valorTotal > 0) {
        // Criar uma cópia da ordem com o novo status para gerar a conta
        const ordemComNovoStatus = { ...ordemAtual, status: novoStatus };
        await gerarContaReceber(ordemComNovoStatus);
      }
      
      // Se mudou para "Cancelado", excluir a conta a receber relacionada
      if (novoStatus === StatusOrdemServico.CANCELADO) {
        await excluirContaReceber(ordemId);
      }

      // Recarregar lista
      await carregarOrdens();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      setErro("Erro ao alterar status da ordem. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta ordem de serviço?")) return;

    setCarregando(true);
    setErro(null);

    try {
      // Excluir conta a receber relacionada, se existir
      await excluirContaReceber(id);
      
      // Excluir ordem no backend
      await ordemServicoService.delete(api, id);

      // Recarregar lista
      await carregarOrdens();
    } catch (error) {
      console.error("Erro ao excluir ordem:", error);
      setErro("Erro ao excluir ordem de serviço. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleEdit = (ordem: OrdemServico) => {
    setEditingOrdemId(ordem.id);
    setEditFormData({
      cliente: ordem.cliente,
      telefone: ordem.telefone,
      email: ordem.email,
      marcaVeiculo: ordem.marcaVeiculo,
      modeloVeiculo: ordem.modeloVeiculo,
      placa: ordem.placa,
      ano: ordem.ano,
      cor: ordem.cor,
      descricaoProblema: ordem.descricaoProblema,
      prioridade: ordem.prioridade,
      status: ordem.status,
      mecanico: ordem.mecanico,
      observacoes: ordem.observacoes,
    });
    if (ordem.itens && ordem.itens.length > 0) {
      setEditItens(ordem.itens);
    } else {
      setEditItens([{ id: 1, descricao: "", quantidade: "", valorUnitario: "", valorTotal: "" }]);
    }
    setIsEditMode(true);
    setIsEditModalOpen(true);
    // Carrega dados necessários quando abrir o modal de edição
    carregarClientes();
    carregarFuncionarios();
    carregarServicos();
  };

  const handleView = (ordem: OrdemServico) => {
    setEditingOrdemId(ordem.id);
    setEditFormData({
      cliente: ordem.cliente,
      telefone: ordem.telefone,
      email: ordem.email,
      marcaVeiculo: ordem.marcaVeiculo,
      modeloVeiculo: ordem.modeloVeiculo,
      placa: ordem.placa,
      ano: ordem.ano,
      cor: ordem.cor,
      descricaoProblema: ordem.descricaoProblema,
      prioridade: ordem.prioridade,
      status: ordem.status,
      mecanico: ordem.mecanico,
      observacoes: ordem.observacoes,
    });
    if (ordem.itens && ordem.itens.length > 0) {
      setEditItens(ordem.itens);
    } else {
      setEditItens([{ id: 1, descricao: "", quantidade: "", valorUnitario: "", valorTotal: "" }]);
    }
    setIsEditMode(false);
    setIsEditModalOpen(true);
    // Carrega dados necessários quando abrir o modal de edição
    carregarClientes();
    carregarFuncionarios();
    carregarServicos();
  };

  const getStatusIcon = (status: StatusOrdemServico) => {
    switch (status) {
      case StatusOrdemServico.ORCAMENTO:
        return Clock;
      case StatusOrdemServico.EM_ANDAMENTO:
        return Wrench;
      case StatusOrdemServico.AGUARDANDO_PECAS:
        return AlertCircle;
      case StatusOrdemServico.FINALIZADO:
        return CheckCircle;
      case StatusOrdemServico.CANCELADO:
        return Trash2;
      default:
        return ClipboardCheck;
    }
  };

  const getStatusColor = (status: StatusOrdemServico) => {
    switch (status) {
      case StatusOrdemServico.ORCAMENTO:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case StatusOrdemServico.EM_ANDAMENTO:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case StatusOrdemServico.AGUARDANDO_PECAS:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case StatusOrdemServico.FINALIZADO:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case StatusOrdemServico.CANCELADO:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadeColor = (prioridade: Prioridade) => {
    switch (prioridade) {
      case Prioridade.BAIXA:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case Prioridade.MEDIA:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case Prioridade.ALTA:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteSearchTerm.toLowerCase())
  );

  const marcasFiltradas = marcas.filter(m =>
    m.nome.toLowerCase().includes(marcaSearchTerm.toLowerCase())
  );

  const veiculosDoCliente = getVeiculosDoCliente();
  const modeloMarcaId = marcas.find(m => m.nome === formData.marcaVeiculo)?.id;
  const modelosDisponiveis = modelos.filter(m => m.marcaId === modeloMarcaId);
  const modelosFiltrados = modelosDisponiveis.filter(m =>
    m.nome.toLowerCase().includes(modeloSearchTerm.toLowerCase())
  );
  
  // Se há cliente selecionado com veículos, mostra os veículos do cliente
  const veiculosDisponiveis = selectedClienteId && veiculosDoCliente.length > 0 
    ? veiculosDoCliente 
    : modelosDisponiveis;
  
  const veiculosFiltrados = veiculosDoCliente.length > 0 && selectedClienteId
    ? veiculosDoCliente.filter(v => 
        `${v.marca} ${v.modelo} - ${v.placa}`.toLowerCase().includes(modeloSearchTerm.toLowerCase())
      )
    : modelosFiltrados;

  // Calcular ordens filtradas
  // Contar ordens por status para os cards (usando dados carregados)
  const contarPorStatus = (status: StatusOrdemServico) => {
    // Nota: Este é um cálculo local dos dados carregados
    // Para valores exatos, o backend deveria retornar estatísticas
    return ordens.filter(os => os.status === status).length;
  };

  // Resetar para página 0 quando mudar filtro ou quantidade por página
  const handleFiltroChange = (novoFiltro: StatusOrdemServico | null) => {
    setStatusFiltro(novoFiltro);
    setPaginaAtualBackend(0);
  };

  const handleItensPorPaginaChange = (novaQuantidade: number) => {
    setItensPorPagina(novaQuantidade);
    setPaginaAtualBackend(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gestão de ordens de serviço da oficina</p>
        </div>
        <Button onClick={() => {
          setIsModalOpen(true);
          // Carrega dados necessários quando abrir o modal
          carregarClientes();
          carregarFuncionarios();
          carregarServicos();
        }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Card Todos */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFiltro === null 
              ? "ring-2 ring-primary shadow-md" 
              : ""
          }`}
          onClick={() => handleFiltroChange(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Todos</p>
                <p className="text-2xl font-bold">{totalElementos}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                statusFiltro === null ? "bg-primary" : "bg-primary/10"
              }`}>
                <ClipboardCheck className={`h-6 w-6 ${
                  statusFiltro === null ? "text-primary-foreground" : "text-primary"
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {Object.values(StatusOrdemServico).map((status) => {
          const count = contarPorStatus(status);
          const StatusIcon = getStatusIcon(status);
          const isSelected = statusFiltro === status;
          return (
            <Card 
              key={status}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? "ring-2 ring-primary shadow-md" 
                  : ""
              }`}
              onClick={() => handleFiltroChange(isSelected ? null : status)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    isSelected ? "bg-primary" : "bg-primary/10"
                  }`}>
                    <StatusIcon className={`h-6 w-6 ${
                      isSelected ? "text-primary-foreground" : "text-primary"
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Lista de Ordens de Serviço
              {statusFiltro && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  - Filtrando por: {statusFiltro}
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Itens por página:</label>
              <select
                value={itensPorPagina}
                onChange={(e) => handleItensPorPaginaChange(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {carregando && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            )}
            {erro && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-800 dark:text-red-400">{erro}</p>
              </div>
            )}
            {!carregando && !erro && ordens.length > 0 ? (
              ordens.map((ordem) => {
              const StatusIcon = getStatusIcon(ordem.status);
              return (
                <div
                  key={ordem.id}
                  className="rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <StatusIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-lg">{ordem.numero}</p>
                          <select
                            value={ordem.status}
                            onChange={(e) => alterarStatusOrdemServico(ordem.id, e.target.value as StatusOrdemServico)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ textAlign: 'center', textAlignLast: 'center' }}
                            className={`status-select font-semibold rounded-full px-3 py-1 border-none cursor-pointer text-xs ${getStatusColor(ordem.status)}`}
                          >
                            <option value={StatusOrdemServico.ORCAMENTO}>Orçamento</option>
                            <option value={StatusOrdemServico.EM_ANDAMENTO}>Em Andamento</option>
                            <option value={StatusOrdemServico.AGUARDANDO_PECAS}>Aguardando Peças</option>
                            <option value={StatusOrdemServico.FINALIZADO}>Finalizado</option>
                            <option value={StatusOrdemServico.CANCELADO}>Cancelado</option>
                          </select>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPrioridadeColor(ordem.prioridade)}`}>
                            {ordem.prioridade}
                          </span>
                        </div>
                        <p className="text-sm text-foreground font-medium">{ordem.cliente}</p>
                        <p className="text-sm text-muted-foreground">{ordem.telefone}</p>
                        <p className="text-sm text-muted-foreground">{ordem.email}</p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            <strong className="text-foreground">Veículo:</strong> {ordem.marcaVeiculo} {ordem.modeloVeiculo}
                          </span>
                          <span>
                            <strong className="text-foreground">Placa:</strong> {ordem.placa}
                          </span>
                          <span>
                            <strong className="text-foreground">Mecânico:</strong> {ordem.mecanico}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong className="text-foreground">Problema:</strong> {ordem.descricaoProblema}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Entrada:</strong> {ordem.dataEntrada}
                          </span>
                          {ordem.dataPrevisao && (
                            <span className="text-sm text-muted-foreground">
                              <strong className="text-foreground">Previsão:</strong> {ordem.dataPrevisao}
                            </span>
                          )}
                          {ordem.valorTotal > 0 && (
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              R$ {ordem.valorTotal.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(ordem)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ordem)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ordem.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {statusFiltro 
                    ? `Nenhuma ordem de serviço encontrada com status "${statusFiltro}"`
                    : "Nenhuma ordem de serviço cadastrada"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Controles de Paginação */}
          {!carregando && !erro && totalElementos > 0 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {ordens.length > 0 ? ((paginaAtualBackend * itensPorPagina) + 1) : 0} até {Math.min((paginaAtualBackend + 1) * itensPorPagina, totalElementos)} de {totalElementos} ordens
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtualBackend(prev => Math.max(0, prev - 1))}
                  disabled={paginaAtualBackend === 0 || carregando}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i).map((pagina) => {
                    // Mostrar apenas páginas próximas à atual
                    if (
                      pagina === 0 ||
                      pagina === totalPaginas - 1 ||
                      (pagina >= paginaAtualBackend - 1 && pagina <= paginaAtualBackend + 1)
                    ) {
                      return (
                        <Button
                          key={pagina}
                          variant={pagina === paginaAtualBackend ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPaginaAtualBackend(pagina)}
                          disabled={carregando}
                          className="min-w-[2.5rem]"
                        >
                          {pagina + 1}
                        </Button>
                      );
                    } else if (pagina === paginaAtualBackend - 2 || pagina === paginaAtualBackend + 2) {
                      return <span key={pagina} className="px-2 text-muted-foreground">...</span>;
                    }
                    return null;
            })}
          </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtualBackend(prev => Math.min(totalPaginas - 1, prev + 1))}
                  disabled={paginaAtualBackend >= totalPaginas - 1 || carregando}
                  className="gap-2"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova Ordem */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Ordem de Serviço"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium mb-1">Cliente *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={clienteSearchTerm}
                onChange={(e) => {
                  setClienteSearchTerm(e.target.value);
                  setShowClienteDropdown(true);
                }}
                onFocus={() => setShowClienteDropdown(true)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24"
                placeholder="Digite o nome do cliente"
              />
              <button
                type="button"
                onClick={() => {
                  setIsClienteModalOpen(true);
                  // Carrega clientes quando abrir o modal de cliente
                  carregarClientes();
                }}
                className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {showClienteDropdown && clienteSearchTerm && clientesFiltrados.length > 0 && (
              <div className="mt-1 border border-border rounded-md bg-background max-h-40 overflow-y-auto">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => handleClienteSelect(cliente)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-b border-border last:border-b-0"
                  >
                    {cliente.nome}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                type="text"
                required
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {/* Veículo */}
          {selectedClienteId && veiculosDoCliente.length > 0 ? (
            // Se o cliente tem veículos cadastrados, mostra dropdown de veículos
            <div>
              <label className="block text-sm font-medium mb-1">Veículo *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={modeloSearchTerm}
                  onChange={(e) => {
                    setModeloSearchTerm(e.target.value);
                    setShowModeloDropdown(true);
                  }}
                  onFocus={() => setShowModeloDropdown(true)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24"
                  placeholder="Digite ou selecione o veículo"
                />
                <button
                  type="button"
                  onClick={handleOpenVeiculoClienteModal}
                  className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {showModeloDropdown && modeloSearchTerm && veiculosFiltrados.length > 0 && (
                <div className="mt-1 border border-border rounded-md bg-background max-h-40 overflow-y-auto">
                  {veiculosFiltrados.map((veiculo) => (
                    <button
                      key={veiculo.id}
                      type="button"
                      onClick={() => handleVeiculoClienteSelect(veiculo)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-b border-border last:border-b-0"
                    >
                      <Car className="inline h-4 w-4 mr-2" />
                      {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Se não tem veículos cadastrados, mostra marca/modelo normais
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marca *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={marcaSearchTerm}
                    onChange={(e) => {
                      setMarcaSearchTerm(e.target.value);
                      setShowMarcaDropdown(true);
                    }}
                    onFocus={() => setShowMarcaDropdown(true)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24"
                    placeholder="Digite a marca"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMarcaModalOpen(true)}
                    className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                {showMarcaDropdown && marcaSearchTerm && marcasFiltradas.length > 0 && (
                  <div className="mt-1 border border-border rounded-md bg-background max-h-40 overflow-y-auto">
                    {marcasFiltradas.map((marca) => (
                      <button
                        key={marca.id}
                        type="button"
                        onClick={() => handleMarcaSelect(marca)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-b border-border last:border-b-0"
                      >
                        {marca.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modelo *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={modeloSearchTerm}
                    onChange={(e) => {
                      setModeloSearchTerm(e.target.value);
                      setShowModeloDropdown(true);
                    }}
                    onFocus={() => setShowModeloDropdown(true)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24"
                    placeholder="Digite o modelo"
                    disabled={!formData.marcaVeiculo}
                  />
                  <button
                    type="button"
                    onClick={handleOpenModeloModal}
                    className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors"
                    disabled={!formData.marcaVeiculo}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                {showModeloDropdown && formData.marcaVeiculo && modeloSearchTerm && modelosFiltrados.length > 0 && (
                  <div className="mt-1 border border-border rounded-md bg-background max-h-40 overflow-y-auto">
                    {modelosFiltrados.map((modelo) => (
                      <button
                        key={modelo.id}
                        type="button"
                        onClick={() => handleModeloSelect(modelo)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-b border-border last:border-b-0"
                      >
                        {modelo.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input
                type="text"
                required
                value={formData.placa}
                onChange={(e) => handleInputChange("placa", e.target.value.toUpperCase())}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                readOnly={selectedClienteId && veiculosDoCliente.length > 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ano *</label>
              <input
                type="text"
                required
                value={formData.ano}
                onChange={(e) => handleInputChange("ano", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                readOnly={selectedClienteId && veiculosDoCliente.length > 0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cor *</label>
              <input
                type="text"
                required
                value={formData.cor}
                onChange={(e) => handleInputChange("cor", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                readOnly={selectedClienteId && veiculosDoCliente.length > 0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prioridade *</label>
              <select
                value={formData.prioridade}
                onChange={(e) => handleInputChange("prioridade", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={Prioridade.BAIXA}>Baixa</option>
                <option value={Prioridade.MEDIA}>Média</option>
                <option value={Prioridade.ALTA}>Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição do Problema *</label>
            <textarea
              required
              value={formData.descricaoProblema}
              onChange={(e) => handleInputChange("descricaoProblema", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mecânico Responsável *</label>
            <select
              required
              value={formData.mecanico}
              onChange={(e) => handleInputChange("mecanico", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione um mecânico</option>
              {mecanicos.map((mecanico) => (
                <option key={mecanico.id} value={mecanico.nome}>
                  {mecanico.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Itens de Serviço</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>
            <div className="space-y-3">
              {itens.map((item) => {
                const servicoSelecionado = item.servicoId ? servicos.find(s => s.id === item.servicoId) : null;
                const funcionarioSelecionado = formData.mecanico ? mecanicos.find(m => m.nome === formData.mecanico) : null;
                let detalhesCalculo = null;
                
                if (servicoSelecionado && funcionarioSelecionado) {
                  detalhesCalculo = calcularValorEstimadoServico(
                    servicoSelecionado,
                    funcionarioSelecionado,
                    configuracoesFinanceiras
                  );
                }

                return (
                  <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <label className="block text-xs font-medium mb-1">Serviço</label>
                        <select
                          value={item.servicoId || ""}
                          onChange={(e) => handleItemChange(item.id, "servicoId", e.target.value)}
                          onFocus={() => carregarServicos()}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                        >
                          <option value="">Selecione um serviço ou digite manualmente</option>
                          {servicos.map((servico) => (
                            <option key={servico.id} value={servico.id}>
                              {servico.nome} ({servico.tempoEstimadoHoras}h)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-6">
                        <label className="block text-xs font-medium mb-1">Descrição (ou digite manualmente)</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => handleItemChange(item.id, "descricao", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      placeholder="Serviço ou peça"
                          disabled={!!item.servicoId}
                    />
                  </div>
                    </div>
                    
                    {servicoSelecionado && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 text-xs">
                        <p className="text-blue-800 dark:text-blue-300">
                          <Clock className="h-3 w-3 inline mr-1" />
                          <strong>Tempo estimado:</strong> {servicoSelecionado.tempoEstimadoHoras}h
                          {funcionarioSelecionado && detalhesCalculo && (
                            <>
                              {" • "}<strong>Valor/hora:</strong> R$ {detalhesCalculo.valorHoraFuncionario.toFixed(2)}
                              {" • "}<strong>Custo médio:</strong> R$ {detalhesCalculo.custoMedio.toFixed(2)}
                              {" • "}<strong>Mão de obra:</strong> R$ {detalhesCalculo.valorMaoObra.toFixed(2)}
                              {" • "}<strong>Margem ({configuracoesFinanceiras.margemLucroPorAtendimento}%):</strong> R$ {detalhesCalculo.margemLucro.toFixed(2)}
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Quantidade</label>
                    <input
                      type="number"
                          min="1"
                      value={item.quantidade}
                      onChange={(e) => handleItemChange(item.id, "quantidade", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      placeholder="1"
                    />
                  </div>
                      <div className="col-span-3">
                    <label className="block text-xs font-medium mb-1">Valor Unit.</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => handleItemChange(item.id, "valorUnitario", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      placeholder="0.00"
                          readOnly={!!item.servicoId && !!formData.mecanico}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Total</label>
                    <input
                      type="text"
                      value={item.valorTotal}
                      readOnly
                          className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-sm font-semibold"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-1">
                    {itens.length > 1 && (
                      <Button
                        type="button"
                            variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                            className="h-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                    
                    {!formData.mecanico && item.servicoId && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        ⚠ Selecione um mecânico para calcular o valor estimado
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Novo Cliente */}
      <Modal
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        title="Novo Cliente"
      >
        <form onSubmit={handleNewClienteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              required
              value={newCliente.nome}
              onChange={(e) => setNewCliente({ ...newCliente, nome: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                type="text"
                required
                value={newCliente.telefone}
                onChange={(e) => setNewCliente({ ...newCliente, telefone: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={newCliente.email}
                onChange={(e) => setNewCliente({ ...newCliente, email: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CPF</label>
            <input
              type="text"
              value={newCliente.cpf}
              onChange={(e) => setNewCliente({ ...newCliente, cpf: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="000.000.000-00"
            />
          </div>

          {/* Endereço */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Endereço</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">CEP</label>
                <input
                  type="text"
                  value={newCliente.endereco.cep}
                  onChange={(e) => handleNewClienteEnderecoChange("cep", e.target.value)}
                  onBlur={(e) => handleNewClienteCepBlur(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="00000-000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logradouro</label>
                <input
                  type="text"
                  value={newCliente.endereco.logradouro}
                  onChange={(e) => handleNewClienteEnderecoChange("logradouro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número</label>
                  <input
                    type="text"
                    value={newCliente.endereco.numero}
                    onChange={(e) => handleNewClienteEnderecoChange("numero", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Complemento</label>
                  <input
                    type="text"
                    value={newCliente.endereco.complemento}
                    onChange={(e) => handleNewClienteEnderecoChange("complemento", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bairro</label>
                <input
                  type="text"
                  value={newCliente.endereco.bairro}
                  onChange={(e) => handleNewClienteEnderecoChange("bairro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Bairro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    value={newCliente.endereco.cidade}
                    onChange={(e) => handleNewClienteEnderecoChange("cidade", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newCliente.endereco.estado}
                    onChange={(e) => handleNewClienteEnderecoChange("estado", e.target.value.toUpperCase())}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="SP"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Veículos */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Veículos</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddNewVeiculo} className="gap-2">
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </div>
            {newVeiculosCliente.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {newVeiculosCliente.map((veiculo) => (
                  <div key={veiculo.id} className="flex items-center justify-between rounded-md border border-border bg-background p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-primary" />
                      <span className="font-medium">{veiculo.marca} {veiculo.modelo}</span>
                      <span className="text-muted-foreground">- {veiculo.placa}</span>
                      {veiculo.ano && <span className="text-muted-foreground">({veiculo.ano})</span>}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveNewVeiculo(veiculo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsClienteModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Nova Marca */}
      <Modal
        isOpen={isMarcaModalOpen}
        onClose={() => setIsMarcaModalOpen(false)}
        title="Nova Marca"
      >
        <form onSubmit={handleNewMarcaSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Marca *</label>
            <input
              type="text"
              required
              value={newMarca.nome}
              onChange={(e) => setNewMarca({ nome: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Honda"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsMarcaModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Novo Modelo */}
      <Modal
        isOpen={isModeloModalOpen}
        onClose={() => setIsModeloModalOpen(false)}
        title="Novo Modelo"
      >
        <form onSubmit={handleNewModeloSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Marca *</label>
            <select
              required
              value={newModelo.marcaId}
              onChange={(e) => setNewModelo({ ...newModelo, marcaId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione uma marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nome do Modelo *</label>
            <input
              type="text"
              required
              value={newModelo.nome}
              onChange={(e) => setNewModelo({ ...newModelo, nome: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Civic"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModeloModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição/Visualização */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={isEditMode ? "Editar Ordem de Serviço" : "Visualizar Ordem de Serviço"}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cliente *</label>
              <input
                type="text"
                required
                value={editFormData.cliente}
                onChange={(e) => handleEditInputChange("cliente", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                type="text"
                required
                value={editFormData.telefone}
                onChange={(e) => handleEditInputChange("telefone", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) => handleEditInputChange("email", e.target.value)}
              disabled={!isEditMode}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Marca *</label>
              <input
                type="text"
                required
                value={editFormData.marcaVeiculo}
                onChange={(e) => handleEditInputChange("marcaVeiculo", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modelo *</label>
              <input
                type="text"
                required
                value={editFormData.modeloVeiculo}
                onChange={(e) => handleEditInputChange("modeloVeiculo", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input
                type="text"
                required
                value={editFormData.placa}
                onChange={(e) => handleEditInputChange("placa", e.target.value.toUpperCase())}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ano *</label>
              <input
                type="text"
                required
                value={editFormData.ano}
                onChange={(e) => handleEditInputChange("ano", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cor *</label>
              <input
                type="text"
                required
                value={editFormData.cor}
                onChange={(e) => handleEditInputChange("cor", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prioridade *</label>
              <select
                value={editFormData.prioridade}
                onChange={(e) => handleEditInputChange("prioridade", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value={Prioridade.BAIXA}>Baixa</option>
                <option value={Prioridade.MEDIA}>Média</option>
                <option value={Prioridade.ALTA}>Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição do Problema *</label>
            <textarea
              required
              value={editFormData.descricaoProblema}
              onChange={(e) => handleEditInputChange("descricaoProblema", e.target.value)}
              disabled={!isEditMode}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isEditMode && (
              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => handleEditInputChange("status", e.target.value)}
                  className="status-select w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center"
                >
                  {Object.values(StatusOrdemServico).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Mecânico Responsável *</label>
              <select
                required
                value={editFormData.mecanico}
                onChange={(e) => handleEditInputChange("mecanico", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Selecione um mecânico</option>
                {mecanicos.map((mecanico) => (
                  <option key={mecanico.id} value={mecanico.nome}>
                    {mecanico.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={editFormData.observacoes}
              onChange={(e) => handleEditInputChange("observacoes", e.target.value)}
              disabled={!isEditMode}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Itens de Serviço</h3>
              {isEditMode && (
                <Button type="button" variant="outline" size="sm" onClick={addEditItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Item
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {editItens.map((item) => {
                const servicoSelecionado = item.servicoId ? servicos.find(s => s.id === item.servicoId) : null;
                const funcionarioSelecionado = editFormData.mecanico ? mecanicos.find(m => m.nome === editFormData.mecanico) : null;
                let detalhesCalculo = null;
                
                if (servicoSelecionado && funcionarioSelecionado) {
                  detalhesCalculo = calcularValorEstimadoServico(
                    servicoSelecionado,
                    funcionarioSelecionado,
                    configuracoesFinanceiras
                  );
                }

                return (
                  <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <label className="block text-xs font-medium mb-1">Serviço</label>
                        <select
                          value={item.servicoId || ""}
                          onChange={(e) => handleEditItemChange(item.id, "servicoId", e.target.value)}
                          onFocus={() => carregarServicos()}
                          disabled={!isEditMode}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm disabled:opacity-50"
                        >
                          <option value="">Selecione um serviço ou digite manualmente</option>
                          {servicos.map((servico) => (
                            <option key={servico.id} value={servico.id}>
                              {servico.nome} ({servico.tempoEstimadoHoras}h)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-6">
                        <label className="block text-xs font-medium mb-1">Descrição (ou digite manualmente)</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => handleEditItemChange(item.id, "descricao", e.target.value)}
                          disabled={!isEditMode || !!item.servicoId}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm disabled:opacity-50"
                      placeholder="Serviço ou peça"
                    />
                  </div>
                    </div>
                    
                    {servicoSelecionado && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 text-xs">
                        <p className="text-blue-800 dark:text-blue-300">
                          <Clock className="h-3 w-3 inline mr-1" />
                          <strong>Tempo estimado:</strong> {servicoSelecionado.tempoEstimadoHoras}h
                          {funcionarioSelecionado && detalhesCalculo && (
                            <>
                              {" • "}<strong>Valor/hora:</strong> R$ {detalhesCalculo.valorHoraFuncionario.toFixed(2)}
                              {" • "}<strong>Custo médio:</strong> R$ {detalhesCalculo.custoMedio.toFixed(2)}
                              {" • "}<strong>Mão de obra:</strong> R$ {detalhesCalculo.valorMaoObra.toFixed(2)}
                              {" • "}<strong>Margem ({configuracoesFinanceiras.margemLucroPorAtendimento}%):</strong> R$ {detalhesCalculo.margemLucro.toFixed(2)}
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Quantidade</label>
                    <input
                      type="number"
                          min="1"
                      value={item.quantidade}
                      onChange={(e) => handleEditItemChange(item.id, "quantidade", e.target.value)}
                      disabled={!isEditMode}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm disabled:opacity-50"
                      placeholder="1"
                    />
                  </div>
                      <div className="col-span-3">
                    <label className="block text-xs font-medium mb-1">Valor Unit.</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => handleEditItemChange(item.id, "valorUnitario", e.target.value)}
                          disabled={!isEditMode || (!!item.servicoId && !!editFormData.mecanico)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm disabled:opacity-50"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Total</label>
                    <input
                      type="text"
                      value={item.valorTotal}
                      readOnly
                          className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-sm font-semibold"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-1">
                    {editItens.length > 1 && isEditMode && (
                      <Button
                        type="button"
                            variant="ghost"
                        size="sm"
                        onClick={() => removeEditItem(item.id)}
                            className="h-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                    
                    {!editFormData.mecanico && item.servicoId && (
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        ⚠ Selecione um mecânico para calcular o valor estimado
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {isEditMode ? "Cancelar" : "Fechar"}
            </Button>
            {isEditMode && <Button type="submit">Salvar</Button>}
          </div>
        </form>
      </Modal>

      {/* Modal de Novo Veículo do Cliente */}
      <Modal
        isOpen={isVeiculoClienteModalOpen}
        onClose={() => setIsVeiculoClienteModalOpen(false)}
        title="Adicionar Veículo ao Cliente"
      >
        <form onSubmit={handleNewVeiculoClienteSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Marca *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={marcaSearchTerm}
                  onChange={(e) => {
                    setMarcaSearchTerm(e.target.value);
                    setShowMarcaDropdown(true);
                  }}
                  onFocus={() => setShowMarcaDropdown(true)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24"
                  placeholder="Digite a marca"
                />
                <button
                  type="button"
                  onClick={() => setIsMarcaModalOpen(true)}
                  className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {showMarcaDropdown && marcaSearchTerm && marcasFiltradas.length > 0 && (
                <div className="mt-1 border border-border rounded-md bg-background max-h-40 overflow-y-auto">
                  {marcasFiltradas.map((marca) => (
                    <button
                      key={marca.id}
                      type="button"
                      onClick={() => {
                        setNewVeiculoCliente({ ...newVeiculoCliente, marca: marca.nome });
                        setMarcaSearchTerm(marca.nome);
                        setShowMarcaDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-b border-border last:border-b-0"
                    >
                      {marca.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modelo *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={newVeiculoCliente.modelo}
                  onChange={(e) => setNewVeiculoCliente({ ...newVeiculoCliente, modelo: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Digite o modelo"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input
                type="text"
                required
                value={newVeiculoCliente.placa}
                onChange={(e) => setNewVeiculoCliente({ ...newVeiculoCliente, placa: e.target.value.toUpperCase() })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ano</label>
              <input
                type="text"
                value={newVeiculoCliente.ano}
                onChange={(e) => setNewVeiculoCliente({ ...newVeiculoCliente, ano: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="2020"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input
              type="text"
              value={newVeiculoCliente.cor}
              onChange={(e) => setNewVeiculoCliente({ ...newVeiculoCliente, cor: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Prata"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsVeiculoClienteModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Adicionar Veículo - Novo Cliente */}
      <Modal
        isOpen={isNewVeiculoModalOpen}
        onClose={() => setIsNewVeiculoModalOpen(false)}
        title="Adicionar Veículo"
      >
        <form onSubmit={handleSaveNewVeiculo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Marca *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={marcaSearchTerm}
                  onChange={(e) => {
                    setMarcaSearchTerm(e.target.value);
                    setShowMarcaDropdown(true);
                  }}
                  onFocus={() => setShowMarcaDropdown(true)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24"
                  placeholder="Digite a marca"
                />
                <button
                  type="button"
                  onClick={() => setIsMarcaModalOpen(true)}
                  className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {showMarcaDropdown && marcaSearchTerm && marcasFiltradas.length > 0 && (
                <div className="mt-1 border border-border rounded-md bg-background max-h-40 overflow-y-auto">
                  {marcasFiltradas.map((marca) => (
                    <button
                      key={marca.id}
                      type="button"
                      onClick={() => {
                        setNewVeiculoForm({ ...newVeiculoForm, marca: marca.nome });
                        setMarcaSearchTerm(marca.nome);
                        setShowMarcaDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent border-b border-border last:border-b-0"
                    >
                      {marca.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Modelo *</label>
              <input
                type="text"
                required
                value={newVeiculoForm.modelo}
                onChange={(e) => setNewVeiculoForm({ ...newVeiculoForm, modelo: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Digite o modelo"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input
                type="text"
                required
                value={newVeiculoForm.placa}
                onChange={(e) => setNewVeiculoForm({ ...newVeiculoForm, placa: e.target.value.toUpperCase() })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ano</label>
              <input
                type="text"
                value={newVeiculoForm.ano}
                onChange={(e) => setNewVeiculoForm({ ...newVeiculoForm, ano: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="2020"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input
              type="text"
              value={newVeiculoForm.cor}
              onChange={(e) => setNewVeiculoForm({ ...newVeiculoForm, cor: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Prata"
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsNewVeiculoModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
