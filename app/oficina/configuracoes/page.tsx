"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Settings, Plus, Trash2, Edit2, DollarSign, Calculator, Building2, MapPin } from "lucide-react";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { funcionarioService, type FuncionarioAPI } from "@/lib/services/funcionario.service";
import { configuracoesService, type ValorOperacionalAPI, type MarcaAPI, type ModeloAPI, type ConfiguracaoAPI } from "@/lib/services/configuracoes.service";
import type { Funcionario } from "../types";

// Tipos locais para compatibilidade com backend (ObjectId = string)
interface MarcaLocal {
  id: string; // ObjectId do MongoDB
  nome: string;
}

interface ModeloLocal {
  id: string; // ObjectId do MongoDB
  marcaId: string; // ObjectId do MongoDB
  nome: string;
}

interface ValorOperacional {
  id: string; // ObjectId do MongoDB
  descricao: string;
  valor: number;
}

export default function ConfiguracoesPage() {
  const api = useApi();
  const { token } = useAuth();
  const empresaId = api.empresaId;
  
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isModeloModalOpen, setIsModeloModalOpen] = useState(false);
  const [isValorOperacionalModalOpen, setIsValorOperacionalModalOpen] = useState(false);
  const [editingValorOperacionalId, setEditingValorOperacionalId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  
  // Dados da Empresa
  const [dadosEmpresa, setDadosEmpresa] = useState({
    nome: "",
    cnpj: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [buscandoCEP, setBuscandoCEP] = useState(false);

  const [marcaFormData, setMarcaFormData] = useState({
    nome: "",
  });

  const [modeloFormData, setModeloFormData] = useState({
    marcaId: "",
    nome: "",
  });

  const [valorOperacionalFormData, setValorOperacionalFormData] = useState({
    descricao: "",
    valor: "",
  });

  // Configurações gerais
  const [configuracoesGerais, setConfiguracoesGerais] = useState({
    mediaAtendimentosMensais: "10",
    margemLucroPorAtendimento: "10", // em percentual
  });

  // Funções de máscara
  const maskCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const maskCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  // Buscar endereço via ViaCEP
  const buscarEnderecoPorCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      setBuscandoCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setDadosEmpresa((prev) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
            cep: maskCEP(cepLimpo),
          }));
        } else {
          alert("CEP não encontrado. Verifique o CEP digitado.");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        alert("Erro ao buscar CEP. Tente novamente.");
      } finally {
        setBuscandoCEP(false);
      }
    }
  };

  const handleDadosEmpresaChange = (field: string, value: string) => {
    if (field === "cnpj") {
      setDadosEmpresa((prev) => ({ ...prev, [field]: maskCNPJ(value) }));
    } else if (field === "cep") {
      const maskedValue = maskCEP(value);
      setDadosEmpresa((prev) => ({ ...prev, [field]: maskedValue }));
      
      // Buscar endereço quando CEP estiver completo
      const cepLimpo = maskedValue.replace(/\D/g, "");
      if (cepLimpo.length === 8) {
        buscarEnderecoPorCEP(cepLimpo);
      }
    } else {
      setDadosEmpresa((prev) => ({ ...prev, [field]: value }));
    }
  };

  const [valoresOperacionaisBase, setValoresOperacionaisBase] = useState<ValorOperacional[]>([]);
  const [marcas, setMarcas] = useState<MarcaLocal[]>([]);
  const [modelos, setModelos] = useState<ModeloLocal[]>([]);

  // ID fixo para a linha de Colaboradores (não editável/deletável)
  const COLABORADORES_ID = "-1"; // String para compatibilidade com ObjectId

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  // Ref para garantir que os dados sejam carregados apenas uma vez
  const dadosCarregados = useRef(false);
  
  // Carregar dados do backend quando a rota for acessada
  useEffect(() => {
    // Evita carregar duas vezes (mesmo em modo desenvolvimento do React)
    if (dadosCarregados.current) return;
    if (!empresaId || !token) return;
    
    let cancelado = false;
    dadosCarregados.current = true;
    
    async function carregarDados() {
      if (!empresaId || !token) {
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        
        // Carregar funcionários
        const paginaFuncionarios = await funcionarioService.getAll(api, { page: 0, size: 1000 });
        if (cancelado) return;
        
        const funcionariosConvertidos: Funcionario[] = paginaFuncionarios.content.map((f: FuncionarioAPI) => ({
          id: f.id,
          nome: f.nome,
          telefone: f.telefone,
          email: f.email,
          tipo: f.tipo as Funcionario["tipo"],
          tipoContratacao: f.tipoContratacao,
          valorDespesa: f.valorDespesa,
          cpf: f.cpf,
          dataAdmissao: f.dataAdmissao,
          endereco: f.endereco,
        }));
        setFuncionarios(funcionariosConvertidos);

        // Carregar valores operacionais
        const valoresOperacionaisAPI = await configuracoesService.getValoresOperacionais(api);
        if (cancelado) return;
        
        setValoresOperacionaisBase(valoresOperacionaisAPI.map((v: ValorOperacionalAPI): ValorOperacional => ({
          id: v.id,
          descricao: v.descricao,
          valor: v.valor,
        })));

        // Carregar configurações gerais e dados da empresa
        try {
          const config = await configuracoesService.getConfiguracao(api);
          if (cancelado) return;
          
          setDadosEmpresa({
            nome: config.nomeEmpresa || "",
            cnpj: config.cnpjEmpresa || "",
            cep: config.cepEmpresa || "",
            logradouro: config.logradouroEmpresa || "",
            numero: config.numeroEmpresa || "",
            complemento: config.complementoEmpresa || "",
            bairro: config.bairroEmpresa || "",
            cidade: config.cidadeEmpresa || "",
            estado: config.estadoEmpresa || "",
          });
          setConfiguracoesGerais({
            mediaAtendimentosMensais: (config.mediaAtendimentosMensais || 10).toString(),
            margemLucroPorAtendimento: (config.margemLucroPorAtendimento || 10).toString(),
          });
        } catch (error: any) {
          // Se for 404, a configuração ainda não existe - isso é normal no primeiro acesso
          if (error?.message?.includes("404") || error?.message?.includes("not found")) {
            console.log("Configurações da empresa ainda não foram criadas - usando valores padrão");
            // Mantém valores padrão que já estão no estado
          } else {
            console.warn("Erro ao carregar configurações gerais:", error);
          }
        }

        // Carregar marcas
        const marcasAPI = await configuracoesService.getMarcas(api);
        if (cancelado) return;
        
        setMarcas(marcasAPI.map((m: MarcaAPI): MarcaLocal => ({
          id: m.id,
          nome: m.nome,
        })));

        // Carregar modelos
        const modelosAPI = await configuracoesService.getModelos(api);
        if (cancelado) return;
        
        setModelos(modelosAPI.map((mo: ModeloAPI): ModeloLocal => ({
          id: mo.id,
          marcaId: mo.marcaId,
          nome: mo.nome,
        })));
      } catch (error) {
        if (cancelado) return;
        console.error("Erro ao carregar dados de configurações:", error);
        setFuncionarios([]);
        setValoresOperacionaisBase([]);
        setMarcas([]);
        setModelos([]);
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    carregarDados();
    
    return () => {
      cancelado = true;
      // Reset apenas se empresaId ou token mudarem
      if (!empresaId || !token) {
        dadosCarregados.current = false;
      }
    };
  }, [empresaId, token]); // Carrega apenas quando empresaId ou token mudarem (não inclui api)

  // Calcular valor de colaboradores
  const valorColaboradores = useMemo(() => {
    return funcionarios.reduce((total, func) => total + (func.valorDespesa || 0), 0);
  }, [funcionarios]);

  // Combinar valores operacionais base com a linha de colaboradores
  const valoresOperacionais = useMemo(() => {
    const valores = [...valoresOperacionaisBase];
    
    // Adicionar ou atualizar linha de Colaboradores apenas se houver funcionários
    if (funcionarios.length > 0 && valorColaboradores > 0) {
      const indexColaboradores = valores.findIndex(v => v.id === COLABORADORES_ID);
      const linhaColaboradores: ValorOperacional = {
        id: COLABORADORES_ID,
        descricao: "Colaboradores",
        valor: valorColaboradores,
      };
      
      if (indexColaboradores >= 0) {
        // Atualizar se já existe
        valores[indexColaboradores] = linhaColaboradores;
      } else {
        // Adicionar se não existe
        valores.push(linhaColaboradores);
      }
    } else {
      // Remover linha de Colaboradores se não houver funcionários ou valor for zero
      const indexColaboradores = valores.findIndex(v => v.id === COLABORADORES_ID);
      if (indexColaboradores >= 0) {
        valores.splice(indexColaboradores, 1);
      }
    }
    
    return valores;
  }, [valoresOperacionaisBase, valorColaboradores, funcionarios]);


  // Estados para dropdowns e pesquisa
  const [marcaSearchTerm, setMarcaSearchTerm] = useState("");
  const [modeloSearchTerm, setModeloSearchTerm] = useState("");
  const [selectedMarcaId, setSelectedMarcaId] = useState<string | null>(null);
  const [showMarcaDropdown, setShowMarcaDropdown] = useState(false);
  const [showModeloDropdown, setShowModeloDropdown] = useState(false);

  // Filtros
  const marcasFiltradas = marcas.filter((marca) =>
    marca.nome.toLowerCase().includes(marcaSearchTerm.toLowerCase())
  );

  const modelosFiltrados = modelos.filter((modelo) => {
    const marcaMatch = selectedMarcaId ? modelo.marcaId === selectedMarcaId : true;
    const nomeMatch = modelo.nome.toLowerCase().includes(modeloSearchTerm.toLowerCase());
    return marcaMatch && nomeMatch;
  });

  const handleMarcaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const marcaNova = await configuracoesService.createMarca(api, { nome: marcaFormData.nome });
      const novaMarca: MarcaLocal = {
        id: marcaNova.id,
        nome: marcaNova.nome,
      };
      
      setMarcas([...marcas, novaMarca]);
      handleMarcaSelect(novaMarca); // Auto-select the new brand
      setIsMarcaModalOpen(false);
      setMarcaFormData({ nome: "" });
    } catch (error) {
      console.error("Erro ao criar marca:", error);
      alert("Erro ao criar marca. Tente novamente.");
    }
  };

  const handleModeloSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const modeloNovo = await configuracoesService.createModelo(api, {
        marcaId: modeloFormData.marcaId, // Já é string (ObjectId)
        nome: modeloFormData.nome,
      });
      const novoModelo: ModeloLocal = {
        id: modeloNovo.id,
        marcaId: modeloNovo.marcaId,
        nome: modeloNovo.nome,
      };
      
      setModelos([...modelos, novoModelo]);
      handleModeloSelect(novoModelo); // Auto-select the new model
      setIsModeloModalOpen(false);
      setModeloFormData({ marcaId: "", nome: "" });
    } catch (error) {
      console.error("Erro ao criar modelo:", error);
      alert("Erro ao criar modelo. Tente novamente.");
    }
  };

  const handleMarcaSelect = (marca: MarcaLocal) => {
    setMarcaSearchTerm(marca.nome);
    setSelectedMarcaId(marca.id);
    setShowMarcaDropdown(false);
    setModeloSearchTerm(""); // Clear model search when brand changes
  };

  const handleModeloSelect = (modelo: ModeloLocal) => {
    setModeloSearchTerm(modelo.nome);
    setShowModeloDropdown(false);
  };

  const handleOpenModeloModal = () => {
    if (!selectedMarcaId) {
      alert("Por favor, selecione uma marca primeiro.");
      return;
    }
    setModeloFormData({ marcaId: selectedMarcaId, nome: "" });
    setIsModeloModalOpen(true);
  };

  // Valores Operacionais
  const handleValorOperacionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingValorOperacionalId) {
        // Atualizar
        const valorAtualizado = await configuracoesService.updateValorOperacional(api, editingValorOperacionalId, {
          descricao: valorOperacionalFormData.descricao,
          valor: parseFloat(valorOperacionalFormData.valor),
        });
        setValoresOperacionaisBase(valoresOperacionaisBase.map(v => 
          v.id === editingValorOperacionalId 
            ? { id: valorAtualizado.id, descricao: valorAtualizado.descricao, valor: valorAtualizado.valor }
            : v
        ));
        setEditingValorOperacionalId(null);
      } else {
        // Criar
        const valorNovo = await configuracoesService.createValorOperacional(api, {
          descricao: valorOperacionalFormData.descricao,
          valor: parseFloat(valorOperacionalFormData.valor),
        });
        setValoresOperacionaisBase([...valoresOperacionaisBase, {
          id: valorNovo.id,
          descricao: valorNovo.descricao,
          valor: valorNovo.valor,
        }]);
      }
      setIsValorOperacionalModalOpen(false);
      setValorOperacionalFormData({ descricao: "", valor: "" });
    } catch (error) {
      console.error("Erro ao salvar valor operacional:", error);
      alert("Erro ao salvar valor operacional. Tente novamente.");
    }
  };

  const handleEditValorOperacional = (valor: ValorOperacional) => {
    // Não permitir editar a linha de Colaboradores
    if (valor.id === COLABORADORES_ID) {
      alert("A linha 'Colaboradores' é automática e não pode ser editada. Ela é calculada automaticamente com base nos funcionários cadastrados.");
      return;
    }
    setEditingValorOperacionalId(valor.id);
    setValorOperacionalFormData({ descricao: valor.descricao, valor: valor.valor.toString() });
    setIsValorOperacionalModalOpen(true);
  };

  const handleDeleteValorOperacional = async (id: string) => {
    // Não permitir excluir a linha de Colaboradores
    if (id === COLABORADORES_ID) {
      alert("A linha 'Colaboradores' é automática e não pode ser excluída. Ela é calculada automaticamente com base nos funcionários cadastrados.");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este valor operacional?")) {
      try {
        await configuracoesService.deleteValorOperacional(api, id);
        setValoresOperacionaisBase(valoresOperacionaisBase.filter(v => v.id !== id));
      } catch (error) {
        console.error("Erro ao excluir valor operacional:", error);
        alert("Erro ao excluir valor operacional. Tente novamente.");
      }
    }
  };

  // Salvar dados da empresa e configurações gerais
  const handleSaveDadosEmpresa = async () => {
    try {
      await configuracoesService.updateConfiguracao(api, {
        nomeEmpresa: dadosEmpresa.nome,
        cnpjEmpresa: dadosEmpresa.cnpj,
        cepEmpresa: dadosEmpresa.cep,
        logradouroEmpresa: dadosEmpresa.logradouro,
        numeroEmpresa: dadosEmpresa.numero,
        complementoEmpresa: dadosEmpresa.complemento,
        bairroEmpresa: dadosEmpresa.bairro,
        cidadeEmpresa: dadosEmpresa.cidade,
        estadoEmpresa: dadosEmpresa.estado,
        mediaAtendimentosMensais: parseFloat(configuracoesGerais.mediaAtendimentosMensais) || 10,
        margemLucroPorAtendimento: parseFloat(configuracoesGerais.margemLucroPorAtendimento) || 10,
      });
      alert("Dados salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar dados da empresa:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    }
  };

  const totalValoresOperacionais = valoresOperacionais.reduce((sum, v) => sum + v.valor, 0);
  const custoMedioAtendimento = parseFloat(configuracoesGerais.mediaAtendimentosMensais) > 0
    ? totalValoresOperacionais / parseFloat(configuracoesGerais.mediaAtendimentosMensais)
    : 0;

  if (carregando) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Configurações da oficina</p>
      </div>

      {/* Card de Dados da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Empresa *</label>
            <input
              type="text"
              required
              value={dadosEmpresa.nome}
              onChange={(e) => handleDadosEmpresaChange("nome", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Digite o nome da empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">CNPJ *</label>
            <input
              type="text"
              required
              value={dadosEmpresa.cnpj}
              onChange={(e) => handleDadosEmpresaChange("cnpj", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-base">Endereço</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">CEP *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={dadosEmpresa.cep}
                    onChange={(e) => handleDadosEmpresaChange("cep", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {buscandoCEP && (
                    <div className="absolute right-3 top-2.5">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o CEP para buscar o endereço automaticamente
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Logradouro *</label>
                <input
                  type="text"
                  required
                  value={dadosEmpresa.logradouro}
                  onChange={(e) => handleDadosEmpresaChange("logradouro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Número *</label>
                <input
                  type="text"
                  required
                  value={dadosEmpresa.numero}
                  onChange={(e) => handleDadosEmpresaChange("numero", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Complemento</label>
                <input
                  type="text"
                  value={dadosEmpresa.complemento}
                  onChange={(e) => handleDadosEmpresaChange("complemento", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Apto, Sala, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bairro *</label>
                <input
                  type="text"
                  required
                  value={dadosEmpresa.bairro}
                  onChange={(e) => handleDadosEmpresaChange("bairro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cidade *</label>
                <input
                  type="text"
                  required
                  value={dadosEmpresa.cidade}
                  onChange={(e) => handleDadosEmpresaChange("cidade", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Nome da cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado (UF) *</label>
                <input
                  type="text"
                  required
                  value={dadosEmpresa.estado}
                  onChange={(e) => handleDadosEmpresaChange("estado", e.target.value.toUpperCase())}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveDadosEmpresa} className="gap-2">
              Salvar Dados da Empresa
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Cadastro de Veículos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Marca */}
          <div>
            <label className="block text-sm font-medium mb-2">Marca *</label>
            <div className="relative">
              <input
                type="text"
                value={marcaSearchTerm}
                onChange={(e) => {
                  setMarcaSearchTerm(e.target.value);
                  setShowMarcaDropdown(true);
                }}
                onFocus={() => setShowMarcaDropdown(true)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24"
                placeholder="Digite ou selecione uma marca"
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

          {/* Seleção de Modelo */}
          <div>
            <label className="block text-sm font-medium mb-2">Modelo *</label>
            <div className="relative">
              <input
                type="text"
                value={modeloSearchTerm}
                onChange={(e) => {
                  setModeloSearchTerm(e.target.value);
                  setShowModeloDropdown(true);
                }}
                onFocus={() => setShowModeloDropdown(true)}
                disabled={!selectedMarcaId}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Digite ou selecione um modelo"
              />
              <button
                type="button"
                onClick={handleOpenModeloModal}
                disabled={!selectedMarcaId}
                className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            {showModeloDropdown && selectedMarcaId && modeloSearchTerm && modelosFiltrados.length > 0 && (
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

          {/* Informações adicionais */}
          {marcaSearchTerm && (
            <div className="bg-accent/50 rounded-md p-4">
              <p className="text-sm text-muted-foreground">
                {marcaSearchTerm && `Marca selecionada: <strong>${marcaSearchTerm}</strong>`}
                {modeloSearchTerm && ` | Modelo selecionado: <strong>${modeloSearchTerm}</strong>`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Valores Operacionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Valores Operacionais e Configurações Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lista de Valores Operacionais */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">Valores Operacionais Mensais</label>
              <Button onClick={() => {
                setEditingValorOperacionalId(null);
                setValorOperacionalFormData({ descricao: "", valor: "" });
                setIsValorOperacionalModalOpen(true);
              }} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-2">
              {valoresOperacionais.map((valor) => {
                const isColaboradores = valor.id === COLABORADORES_ID;
                return (
                  <div key={valor.id} className={`flex items-center justify-between rounded-md border border-border bg-background p-3 ${
                    isColaboradores ? "bg-primary/5 border-primary/20" : ""
                  }`}>
                    <div>
                      <p className="font-medium text-sm">
                        {valor.descricao}
                        {isColaboradores && (
                          <span className="ml-2 text-xs text-muted-foreground italic">(automático)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        R$ {valor.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditValorOperacional(valor)}
                        title={isColaboradores ? "Esta linha é calculada automaticamente" : "Editar"}
                        disabled={isColaboradores}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteValorOperacional(valor.id)}
                        title={isColaboradores ? "Esta linha é calculada automaticamente" : "Excluir"}
                        disabled={isColaboradores}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {valoresOperacionais.length > 0 && (
              <div className="mt-4 rounded-md bg-primary/10 p-4 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Total de Valores Operacionais:</span>
                  <span className="font-bold text-lg text-primary">
                    R$ {totalValoresOperacionais.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Configurações Gerais */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-base">Configurações Gerais</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Média de Atendimentos Mensais *
              </label>
              <input
                type="number"
                min="1"
                required
                value={configuracoesGerais.mediaAtendimentosMensais}
                onChange={(e) => setConfiguracoesGerais({
                  ...configuracoesGerais,
                  mediaAtendimentosMensais: e.target.value
                })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Número médio de atendimentos realizados por mês
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Margem de Lucro por Atendimento (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={configuracoesGerais.margemLucroPorAtendimento}
                onChange={(e) => setConfiguracoesGerais({
                  ...configuracoesGerais,
                  margemLucroPorAtendimento: e.target.value
                })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentual de margem de lucro aplicado sobre cada atendimento
              </p>
            </div>
          </div>

          {/* Cálculo do Custo Médio */}
          {configuracoesGerais.mediaAtendimentosMensais && parseFloat(configuracoesGerais.mediaAtendimentosMensais) > 0 && (
            <div className="border-t pt-6">
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-green-700 dark:text-green-300" />
                  <h4 className="font-semibold text-green-800 dark:text-green-300">Cálculo do Custo Médio</h4>
                </div>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <p>
                    <strong>Total Valores Operacionais:</strong> R$ {totalValoresOperacionais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p>
                    <strong>Média de Atendimentos Mensais:</strong> {configuracoesGerais.mediaAtendimentosMensais}
                  </p>
                  <p className="font-bold text-base pt-2 border-t border-green-300 dark:border-green-700">
                    Custo Médio por Atendimento: R$ {custoMedioAtendimento.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs pt-1">
                    Este valor será somado ao valor da mão de obra + margem de lucro para calcular o orçamento
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveDadosEmpresa} className="gap-2">
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Valor Operacional */}
      <Modal
        isOpen={isValorOperacionalModalOpen}
        onClose={() => {
          setIsValorOperacionalModalOpen(false);
          setEditingValorOperacionalId(null);
          setValorOperacionalFormData({ descricao: "", valor: "" });
        }}
        title={editingValorOperacionalId ? "Editar Valor Operacional" : "Novo Valor Operacional"}
      >
        <form onSubmit={handleValorOperacionalSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <input
              type="text"
              required
              value={valorOperacionalFormData.descricao}
              onChange={(e) => setValorOperacionalFormData({ ...valorOperacionalFormData, descricao: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Conta de Luz, Aluguel, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor Mensal (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={valorOperacionalFormData.valor}
              onChange={(e) => setValorOperacionalFormData({ ...valorOperacionalFormData, valor: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsValorOperacionalModalOpen(false);
                setEditingValorOperacionalId(null);
                setValorOperacionalFormData({ descricao: "", valor: "" });
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingValorOperacionalId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Nova Marca */}
      <Modal
        isOpen={isMarcaModalOpen}
        onClose={() => setIsMarcaModalOpen(false)}
        title="Nova Marca"
      >
        <form onSubmit={handleMarcaSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              required
              value={marcaFormData.nome}
              onChange={(e) => setMarcaFormData({ nome: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Honda"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsMarcaModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Novo Modelo */}
      <Modal
        isOpen={isModeloModalOpen}
        onClose={() => setIsModeloModalOpen(false)}
        title="Novo Modelo"
      >
        <form onSubmit={handleModeloSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Marca *</label>
            <select
              required
              value={modeloFormData.marcaId}
              onChange={(e) => setModeloFormData({ ...modeloFormData, marcaId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!!modeloFormData.marcaId}
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
            <label className="block text-sm font-medium mb-1">Modelo *</label>
            <input
              type="text"
              required
              value={modeloFormData.nome}
              onChange={(e) => setModeloFormData({ ...modeloFormData, nome: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Civic"
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setIsModeloModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
