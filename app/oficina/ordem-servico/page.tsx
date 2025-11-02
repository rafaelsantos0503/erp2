"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ClipboardCheck, Plus, Wrench, AlertCircle, CheckCircle, Clock, DollarSign, Trash2, Edit2, Eye, Car } from "lucide-react";
import type { Cliente, VeiculoCliente } from "../clientes/page";
import type { Marca, Modelo, Funcionario } from "../types";

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
  descricao: string;
  quantidade: string;
  valorUnitario: string;
  valorTotal: string;
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

// Dados mockados - será substituído pela integração com backend
const clientesMock: Cliente[] = [
  { 
    id: 1, 
    nome: "João Silva", 
    telefone: "(11) 99999-9999", 
    email: "joao@email.com", 
    cpf: "123.456.789-00", 
    endereco: { 
      cep: "01310-100", 
      logradouro: "Rua das Flores", 
      numero: "123", 
      complemento: "Apto 201", 
      bairro: "Bela Vista", 
      cidade: "São Paulo", 
      estado: "SP" 
    },
    veiculos: [
      { id: 1, marca: "Honda", modelo: "Civic", placa: "ABC-1234", ano: "2020", cor: "Prata" },
      { id: 2, marca: "Toyota", modelo: "Corolla", placa: "DEF-5678", ano: "2019", cor: "Branco" }
    ]
  },
  { 
    id: 2, 
    nome: "Maria Santos", 
    telefone: "(11) 88888-8888", 
    email: "maria@email.com", 
    cpf: "987.654.321-00", 
    endereco: { 
      cep: "01310-100", 
      logradouro: "Av. Paulista", 
      numero: "1000", 
      bairro: "Bela Vista", 
      cidade: "São Paulo", 
      estado: "SP" 
    },
    veiculos: [
      { id: 3, marca: "Chevrolet", modelo: "Onix", placa: "GHI-9012", ano: "2021", cor: "Preto" }
    ]
  },
  { id: 3, nome: "Pedro Oliveira", telefone: "(11) 77777-7777", email: "pedro@email.com" },
];

const marcasMock: Marca[] = [
  { id: 1, nome: "Honda" },
  { id: 2, nome: "Toyota" },
  { id: 3, nome: "Chevrolet" },
  { id: 4, nome: "Hyundai" },
  { id: 5, nome: "Volkswagen" },
  { id: 6, nome: "Ford" },
];

const modelosMock: Modelo[] = [
  { id: 1, marcaId: 1, nome: "Civic" },
  { id: 2, marcaId: 1, nome: "Fit" },
  { id: 3, marcaId: 1, nome: "HR-V" },
  { id: 4, marcaId: 2, nome: "Corolla" },
  { id: 5, marcaId: 2, nome: "Yaris" },
  { id: 6, marcaId: 3, nome: "Onix" },
  { id: 7, marcaId: 3, nome: "Prisma" },
  { id: 8, marcaId: 4, nome: "HB20" },
  { id: 9, marcaId: 5, nome: "Gol" },
  { id: 10, marcaId: 5, nome: "Polo" },
  { id: 11, marcaId: 6, nome: "Ka" },
];

const funcionariosMock: Funcionario[] = [
  { id: 1, nome: "Carlos Santos", telefone: "(11) 95555-5555", email: "carlos@oficina.com", tipo: "Mecanico", tipoContratacao: "CLT", valorDespesa: 3500, cpf: "123.456.789-00", dataAdmissao: "01/01/2023" },
  { id: 2, nome: "Roberto Lima", telefone: "(11) 94444-4444", email: "roberto@oficina.com", tipo: "Mecanico", tipoContratacao: "CLT", valorDespesa: 3200, cpf: "234.567.890-11", dataAdmissao: "15/03/2023" },
  { id: 3, nome: "José Ferreira", telefone: "(11) 93333-3333", email: "jose@oficina.com", tipo: "Mecanico", tipoContratacao: "PJ", valorDespesa: 2800, cpf: "345.678.901-22", dataAdmissao: "01/06/2023" },
  { id: 4, nome: "Ana Silva", telefone: "(11) 92222-2222", email: "ana@oficina.com", tipo: "Recepcionista", tipoContratacao: "CLT", valorDespesa: 2200, cpf: "456.789.012-33", dataAdmissao: "01/02/2024" },
  { id: 5, nome: "Maria Costa", telefone: "(11) 91111-1111", email: "maria@oficina.com", tipo: "Recepcionista", tipoContratacao: "CLT", valorDespesa: 2200, cpf: "567.890.123-44", dataAdmissao: "01/04/2024" },
  { id: 6, nome: "João Pereira", telefone: "(11) 90000-0000", email: "joao@oficina.com", tipo: "Gerente", tipoContratacao: "CLT", valorDespesa: 5000, cpf: "678.901.234-55", dataAdmissao: "01/01/2022" },
];

export default function OrdemServicoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isModeloModalOpen, setIsModeloModalOpen] = useState(false);
  const [editingOrdemId, setEditingOrdemId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [marcas, setMarcas] = useState<Marca[]>(marcasMock);
  const [modelos, setModelos] = useState<Modelo[]>(modelosMock);
  const funcionarios = funcionariosMock;
  const mecanicos = funcionarios.filter(f => f.tipo === "Mecanico");
  
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

  const [ordens, setOrdens] = useState<OrdemServico[]>([
    { 
      id: 1, 
      numero: "OS-001", 
      cliente: "João Silva", 
      telefone: "(11) 99999-9999",
      email: "joao@email.com",
      marcaVeiculo: "Honda",
      modeloVeiculo: "Civic",
      placa: "ABC-1234",
      ano: "2020",
      cor: "Prata",
      descricaoProblema: "Barulho no motor ao acelerar",
      prioridade: Prioridade.ALTA,
      status: StatusOrdemServico.EM_ANDAMENTO,
      dataEntrada: "01/03/2025",
      dataPrevisao: "05/03/2025",
      mecanico: "Carlos Santos",
      observacoes: "Troca de óleo também necessário",
      valorTotal: 450.00
    },
    { 
      id: 2, 
      numero: "OS-002", 
      cliente: "Maria Santos", 
      telefone: "(11) 88888-8888",
      email: "maria@email.com",
      marcaVeiculo: "Toyota",
      modeloVeiculo: "Corolla",
      placa: "XYZ-5678",
      ano: "2019",
      cor: "Branco",
      descricaoProblema: "Freios fazendo barulho",
      prioridade: Prioridade.MEDIA,
      status: StatusOrdemServico.AGUARDANDO_PECAS,
      dataEntrada: "28/02/2025",
      dataPrevisao: "04/03/2025",
      mecanico: "Ana Costa",
      observacoes: "Aguardando pastilhas de freio",
      valorTotal: 320.00
    },
    { 
      id: 3, 
      numero: "OS-003", 
      cliente: "Pedro Oliveira", 
      telefone: "(11) 77777-7777",
      email: "pedro@email.com",
      marcaVeiculo: "Chevrolet",
      modeloVeiculo: "Onix",
      placa: "DEF-9012",
      ano: "2021",
      cor: "Preto",
      descricaoProblema: "Revisão básica",
      prioridade: Prioridade.BAIXA,
      status: StatusOrdemServico.FINALIZADO,
      dataEntrada: "27/02/2025",
      dataPrevisao: "01/03/2025",
      mecanico: "Carlos Santos",
      observacoes: "Revisão completa realizada",
      valorTotal: 180.00
    },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (
    id: number,
    field: keyof ItemServico,
    value: string
  ) => {
    setItens((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
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
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditItemChange = (
    id: number,
    field: keyof ItemServico,
    value: string
  ) => {
    setEditItens((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = ordens.length + 1;
    const numeroOS = `OS-${String(novoId).padStart(3, "0")}`;
    const hoje = new Date().toLocaleDateString('pt-BR');
    
    const valorTotal = itens.reduce((sum, item) => {
      const qtd = parseFloat(item.quantidade) || 0;
      const valor = parseFloat(item.valorUnitario) || 0;
      return sum + (qtd * valor);
    }, 0);

    const novaOrdem: OrdemServico = {
      id: novoId,
      numero: numeroOS,
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
      status: StatusOrdemServico.ORCAMENTO,
      dataEntrada: hoje,
      dataPrevisao: "",
      mecanico: formData.mecanico,
      observacoes: formData.observacoes,
      valorTotal: valorTotal,
      itens: itens.filter(item => item.descricao && item.quantidade && item.valorUnitario)
    };

    setOrdens([...ordens, novaOrdem]);
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
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrdemId) return;

    const valorTotal = editItens.reduce((sum, item) => {
      const qtd = parseFloat(item.quantidade) || 0;
      const valor = parseFloat(item.valorUnitario) || 0;
      return sum + (qtd * valor);
    }, 0);

    const ordemAtualizada: OrdemServico = {
      ...ordens.find(os => os.id === editingOrdemId)!,
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
      status: editFormData.status as StatusOrdemServico,
      mecanico: editFormData.mecanico,
      observacoes: editFormData.observacoes,
      valorTotal: valorTotal,
      itens: editItens.filter(item => item.descricao && item.quantidade && item.valorUnitario)
    };

    setOrdens(ordens.map(os => os.id === editingOrdemId ? ordemAtualizada : os));
    setIsEditModalOpen(false);
    setEditingOrdemId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta ordem de serviço?")) {
      setOrdens(ordens.filter((os) => os.id !== id));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gestão de ordens de serviço da oficina</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(StatusOrdemServico).map((status) => {
          const count = ordens.filter(os => os.status === status).length;
          const StatusIcon = getStatusIcon(status);
          return (
            <Card key={status}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <StatusIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordens.map((ordem) => {
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
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ordem.status)}`}>
                            {ordem.status}
                          </span>
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
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(ordem)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(ordem)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
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
            })}
          </div>
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
                onClick={() => setIsClienteModalOpen(true)}
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
              {itens.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="block text-xs font-medium mb-1">Descrição</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => handleItemChange(item.id, "descricao", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      placeholder="Serviço ou peça"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Quantidade</label>
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => handleItemChange(item.id, "quantidade", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Valor Unit.</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => handleItemChange(item.id, "valorUnitario", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Total</label>
                    <input
                      type="text"
                      value={item.valorTotal}
                      readOnly
                      className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-1">
                    {itens.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              {editItens.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="block text-xs font-medium mb-1">Descrição</label>
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => handleEditItemChange(item.id, "descricao", e.target.value)}
                      disabled={!isEditMode}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm disabled:opacity-50"
                      placeholder="Serviço ou peça"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Quantidade</label>
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => handleEditItemChange(item.id, "quantidade", e.target.value)}
                      disabled={!isEditMode}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm disabled:opacity-50"
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Valor Unit.</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.valorUnitario}
                      onChange={(e) => handleEditItemChange(item.id, "valorUnitario", e.target.value)}
                      disabled={!isEditMode}
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
                      className="w-full rounded-md border border-input bg-muted px-2 py-1.5 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-1">
                    {editItens.length > 1 && isEditMode && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEditItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
