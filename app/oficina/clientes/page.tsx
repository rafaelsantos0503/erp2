"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Users, Plus, Trash2, Edit2, Car, ChevronLeft, ChevronRight } from "lucide-react";
import type { Endereco, Marca, Modelo } from "../types";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { clienteService, type ClienteAPI } from "@/lib/services/cliente.service";

export interface VeiculoCliente {
  id: number | string;
  marca: string;
  modelo: string;
  placa: string;
  ano?: string;
  cor?: string;
}

export interface Cliente {
  id: number | string;
  nome: string;
  telefone: string;
  email: string;
  cpf?: string;
  endereco?: Endereco;
  veiculos?: VeiculoCliente[];
}

export default function ClientesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClienteId, setEditingClienteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
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
    } as Endereco,
    veiculos: [] as VeiculoCliente[],
  });

  const [editFormData, setEditFormData] = useState({
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
    } as Endereco,
    veiculos: [] as VeiculoCliente[],
  });

  const [currentVeiculos, setCurrentVeiculos] = useState<VeiculoCliente[]>([]);
  const [currentEditVeiculos, setCurrentEditVeiculos] = useState<VeiculoCliente[]>([]);
  const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);
  const [isEditVeiculoModalOpen, setIsEditVeiculoModalOpen] = useState(false);
  const [currentVeiculoForm, setCurrentVeiculoForm] = useState<VeiculoCliente>({ id: 0, marca: "", modelo: "", placa: "", ano: "", cor: "" });

  const [marcas, setMarcas] = useState<Marca[]>([
    { id: 1, nome: "Honda" },
    { id: 2, nome: "Toyota" },
    { id: 3, nome: "Chevrolet" },
    { id: 4, nome: "Hyundai" },
    { id: 5, nome: "Volkswagen" },
    { id: 6, nome: "Ford" },
  ]);

  const [modelos, setModelos] = useState<Modelo[]>([
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
  ]);

  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isModeloModalOpen, setIsModeloModalOpen] = useState(false);
  const [newMarca, setNewMarca] = useState({ nome: "" });
  const [newModelo, setNewModelo] = useState({ marcaId: "", nome: "" });
  const [marcaSearchTerm, setMarcaSearchTerm] = useState("");
  const [modeloSearchTerm, setModeloSearchTerm] = useState("");
  const [showMarcaDropdown, setShowMarcaDropdown] = useState(false);
  const [showModeloDropdown, setShowModeloDropdown] = useState(false);
  const [selectedMarcaId, setSelectedMarcaId] = useState<number | null>(null);

  const api = useApi();
  const { token } = useAuth();
  
  const [clientes, setClientes] = useState<Cliente[]>([]); // Dados carregados do backend

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEnderecoChange = (field: keyof Endereco, value: string) => {
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
  };

  const handleEditEnderecoChange = (field: keyof Endereco, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
  };

  const buscarCep = async (cep: string, isEdit: boolean = false) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        if (isEdit) {
          setEditFormData((prev) => ({
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
        } else {
          setFormData((prev) => ({
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
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleCepBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    buscarCep(e.target.value, false);
  };

  const handleEditCepBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    buscarCep(e.target.value, true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = clientes.length + 1;
    const novoCliente: Cliente = {
      id: novoId,
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email,
      cpf: formData.cpf || undefined,
      endereco: formData.endereco || undefined,
      veiculos: currentVeiculos.length > 0 ? currentVeiculos : undefined,
    };

    setClientes([...clientes, novoCliente]);
    setIsModalOpen(false);
    setFormData({ 
      nome: "", 
      telefone: "", 
      email: "", 
      cpf: "", 
      endereco: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" },
      veiculos: []
    });
    setCurrentVeiculos([]);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClienteId) return;

    const clienteAtualizado: Cliente = {
      ...clientes.find(c => c.id === editingClienteId)!,
      nome: editFormData.nome,
      telefone: editFormData.telefone,
      email: editFormData.email,
      cpf: editFormData.cpf || undefined,
      endereco: editFormData.endereco || undefined,
      veiculos: currentEditVeiculos.length > 0 ? currentEditVeiculos : undefined,
    };

    setClientes(clientes.map(c => c.id === editingClienteId ? clienteAtualizado : c));
    setIsEditModalOpen(false);
    setEditingClienteId(null);
    setCurrentEditVeiculos([]);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      setClientes(clientes.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingClienteId(cliente.id);
    setEditFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      cpf: cliente.cpf || "",
      endereco: cliente.endereco || { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" },
      veiculos: cliente.veiculos || [],
    });
    setCurrentEditVeiculos(cliente.veiculos || []);
    setIsEditModalOpen(true);
  };

  const handleAddVeiculo = () => {
    setMarcaSearchTerm("");
    setModeloSearchTerm("");
    setSelectedMarcaId(null);
    setIsVeiculoModalOpen(true);
    setCurrentVeiculoForm({ id: 0, marca: "", modelo: "", placa: "", ano: "", cor: "" });
  };

  const handleSaveVeiculo = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = currentVeiculos.length > 0 ? Math.max(...currentVeiculos.map(v => v.id)) + 1 : 1;
    const novoVeiculo = { ...currentVeiculoForm, id: novoId };
    setCurrentVeiculos([...currentVeiculos, novoVeiculo]);
    setIsVeiculoModalOpen(false);
    setMarcaSearchTerm("");
    setModeloSearchTerm("");
    setSelectedMarcaId(null);
  };

  const handleRemoveVeiculo = (id: number) => {
    setCurrentVeiculos(currentVeiculos.filter(v => v.id !== id));
  };

  const handleEditAddVeiculo = () => {
    setMarcaSearchTerm("");
    setModeloSearchTerm("");
    setSelectedMarcaId(null);
    setIsEditVeiculoModalOpen(true);
    setCurrentVeiculoForm({ id: 0, marca: "", modelo: "", placa: "", ano: "", cor: "" });
  };

  const handleEditSaveVeiculo = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = currentEditVeiculos.length > 0 ? Math.max(...currentEditVeiculos.map(v => v.id)) + 1 : 1;
    const novoVeiculo = { ...currentVeiculoForm, id: novoId };
    setCurrentEditVeiculos([...currentEditVeiculos, novoVeiculo]);
    setIsEditVeiculoModalOpen(false);
    setMarcaSearchTerm("");
    setModeloSearchTerm("");
    setSelectedMarcaId(null);
  };

  const handleEditRemoveVeiculo = (id: number) => {
    setCurrentEditVeiculos(currentEditVeiculos.filter(v => v.id !== id));
  };

  // Filtros para marca e modelo
  const marcasFiltradas = marcas.filter((marca) =>
    marca.nome.toLowerCase().includes(marcaSearchTerm.toLowerCase())
  );

  const modelosFiltrados = modelos.filter((modelo) => {
    const marcaMatch = selectedMarcaId ? modelo.marcaId === selectedMarcaId : true;
    const nomeMatch = modelo.nome.toLowerCase().includes(modeloSearchTerm.toLowerCase());
    return marcaMatch && nomeMatch;
  });

  const handleMarcaSelect = (marca: Marca) => {
    setCurrentVeiculoForm({ ...currentVeiculoForm, marca: marca.nome });
    setSelectedMarcaId(marca.id);
    setMarcaSearchTerm(marca.nome);
    setShowMarcaDropdown(false);
    setModeloSearchTerm("");
    setCurrentVeiculoForm(prev => ({ ...prev, modelo: "" }));
  };

  const handleModeloSelect = (modelo: Modelo) => {
    setCurrentVeiculoForm({ ...currentVeiculoForm, modelo: modelo.nome });
    setModeloSearchTerm(modelo.nome);
    setShowModeloDropdown(false);
  };

  const handleNewMarcaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = marcas.length + 1;
    const novaMarca: Marca = { id: novoId, nome: newMarca.nome };
    setMarcas([...marcas, novaMarca]);
    handleMarcaSelect(novaMarca);
    setIsMarcaModalOpen(false);
    setNewMarca({ nome: "" });
  };

  const handleNewModeloSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = modelos.length + 1;
    const novoModelo: Modelo = { id: novoId, marcaId: parseInt(newModelo.marcaId), nome: newModelo.nome };
    setModelos([...modelos, novoModelo]);
    handleModeloSelect(novoModelo);
    setIsModeloModalOpen(false);
    setNewModelo({ marcaId: "", nome: "" });
  };

  const handleOpenModeloModal = () => {
    const marcaSelecionada = marcas.find(m => m.nome === currentVeiculoForm.marca);
    if (marcaSelecionada) {
      setNewModelo({ marcaId: marcaSelecionada.id.toString(), nome: "" });
    } else {
      setNewModelo({ marcaId: "", nome: "" });
    }
    setIsModeloModalOpen(true);
  };

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  // Calcular paginação
  const totalPaginas = Math.ceil(clientes.length / itensPorPagina) || 1;
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const clientesPaginaAtual = clientes.slice(indiceInicio, indiceFim);

  // Ref para garantir que os dados sejam carregados apenas uma vez
  const dadosCarregados = useRef(false);
  
  // Ajustar página atual se estiver fora do range válido
  // Carregar clientes do backend quando a rota for acessada
  useEffect(() => {
    // Evita carregar duas vezes (mesmo em modo desenvolvimento do React)
    if (dadosCarregados.current) return;
    if (!api.empresaId || !token) return;
    
    let cancelado = false;
    dadosCarregados.current = true;
    
    async function carregarClientes() {
      if (!api.empresaId || !token) return;
      
      try {
        const pagina = await clienteService.getAll(api, { page: 0, size: 1000 });
        if (cancelado) return;
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
        if (cancelado) return;
        console.error("Erro ao carregar clientes:", error);
        setClientes([]);
      }
    }
    
    carregarClientes();
    
    return () => {
      cancelado = true;
      // Reset apenas se empresaId ou token mudarem
      if (!api.empresaId || !token) {
        dadosCarregados.current = false;
      }
    };
  }, [api.empresaId, token]); // api.empresaId é estável, mas podemos melhorar isso depois

  useEffect(() => {
    if (paginaAtual > totalPaginas && totalPaginas > 0) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  const handleItensPorPaginaChange = (novaQuantidade: number) => {
    setItensPorPagina(novaQuantidade);
    setPaginaAtual(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestão de clientes da oficina</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
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
            {clientesPaginaAtual.length > 0 ? (
              clientesPaginaAtual.map((cliente) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{cliente.nome}</p>
                    <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                    <p className="text-sm text-muted-foreground">{cliente.email}</p>
                    {cliente.cpf && <p className="text-xs text-muted-foreground">CPF: {cliente.cpf}</p>}
                    {cliente.endereco && (
                      <p className="text-xs text-muted-foreground">
                        {cliente.endereco.logradouro}, {cliente.endereco.numero} - {cliente.endereco.bairro}, {cliente.endereco.cidade} - {cliente.endereco.estado}
                      </p>
                    )}
                    {cliente.veiculos && cliente.veiculos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cliente.veiculos.map((veiculo) => (
                          <span key={veiculo.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                            <Car className="h-3 w-3" />
                            {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cliente)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cliente.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
              </div>
            )}
          </div>

          {/* Controles de Paginação */}
          {clientes.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {indiceInicio + 1} até {Math.min(indiceFim, clientes.length)} de {clientes.length} clientes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                  disabled={paginaAtual === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => {
                    if (
                      pagina === 1 ||
                      pagina === totalPaginas ||
                      (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1)
                    ) {
                      return (
                        <Button
                          key={pagina}
                          variant={pagina === paginaAtual ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPaginaAtual(pagina)}
                          className="min-w-[2.5rem]"
                        >
                          {pagina}
                        </Button>
                      );
                    } else if (pagina === paginaAtual - 2 || pagina === paginaAtual + 2) {
                      return <span key={pagina} className="px-2 text-muted-foreground">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                  disabled={paginaAtual === totalPaginas}
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

      {/* Modal de Novo Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Cliente"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
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
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Endereço</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">CEP</label>
                <input
                  type="text"
                  value={formData.endereco.cep}
                  onChange={(e) => handleEnderecoChange("cep", e.target.value)}
                  onBlur={handleCepBlur}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="00000-000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logradouro</label>
                <input
                  type="text"
                  value={formData.endereco.logradouro}
                  onChange={(e) => handleEnderecoChange("logradouro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número</label>
                  <input
                    type="text"
                    value={formData.endereco.numero}
                    onChange={(e) => handleEnderecoChange("numero", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Complemento</label>
                  <input
                    type="text"
                    value={formData.endereco.complemento}
                    onChange={(e) => handleEnderecoChange("complemento", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.endereco.bairro}
                  onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Bairro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formData.endereco.cidade}
                    onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.endereco.estado}
                    onChange={(e) => handleEnderecoChange("estado", e.target.value.toUpperCase())}
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
              <Button type="button" variant="outline" size="sm" onClick={handleAddVeiculo} className="gap-2">
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </div>
            {currentVeiculos.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentVeiculos.map((veiculo) => (
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
                      onClick={() => handleRemoveVeiculo(veiculo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Adicionar Veículo */}
      <Modal
        isOpen={isVeiculoModalOpen}
        onClose={() => setIsVeiculoModalOpen(false)}
        title="Adicionar Veículo"
      >
        <form onSubmit={handleSaveVeiculo} className="space-y-4">
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
                  disabled={!currentVeiculoForm.marca}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Digite o modelo"
                />
                <button
                  type="button"
                  onClick={handleOpenModeloModal}
                  disabled={!currentVeiculoForm.marca}
                  className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {showModeloDropdown && currentVeiculoForm.marca && modeloSearchTerm && modelosFiltrados.length > 0 && (
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input
                type="text"
                required
                value={currentVeiculoForm.placa}
                onChange={(e) => setCurrentVeiculoForm({ ...currentVeiculoForm, placa: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ano</label>
              <input
                type="text"
                value={currentVeiculoForm.ano}
                onChange={(e) => setCurrentVeiculoForm({ ...currentVeiculoForm, ano: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="2020"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input
              type="text"
              value={currentVeiculoForm.cor}
              onChange={(e) => setCurrentVeiculoForm({ ...currentVeiculoForm, cor: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Prata"
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsVeiculoModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Editar Cliente */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Cliente"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              required
              value={editFormData.nome}
              onChange={(e) => handleEditInputChange("nome", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                type="text"
                required
                value={editFormData.telefone}
                onChange={(e) => handleEditInputChange("telefone", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={editFormData.email}
                onChange={(e) => handleEditInputChange("email", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input
                type="text"
                value={editFormData.cpf}
                onChange={(e) => handleEditInputChange("cpf", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Endereço</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">CEP</label>
                <input
                  type="text"
                  value={editFormData.endereco.cep}
                  onChange={(e) => handleEditEnderecoChange("cep", e.target.value)}
                  onBlur={handleEditCepBlur}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logradouro</label>
                <input
                  type="text"
                  value={editFormData.endereco.logradouro}
                  onChange={(e) => handleEditEnderecoChange("logradouro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número</label>
                  <input
                    type="text"
                    value={editFormData.endereco.numero}
                    onChange={(e) => handleEditEnderecoChange("numero", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Complemento</label>
                  <input
                    type="text"
                    value={editFormData.endereco.complemento}
                    onChange={(e) => handleEditEnderecoChange("complemento", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bairro</label>
                <input
                  type="text"
                  value={editFormData.endereco.bairro}
                  onChange={(e) => handleEditEnderecoChange("bairro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    value={editFormData.endereco.cidade}
                    onChange={(e) => handleEditEnderecoChange("cidade", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editFormData.endereco.estado}
                    onChange={(e) => handleEditEnderecoChange("estado", e.target.value.toUpperCase())}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Veículos */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Veículos</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleEditAddVeiculo} className="gap-2">
                <Plus className="h-3 w-3" />
                Adicionar
              </Button>
            </div>
            {currentEditVeiculos.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentEditVeiculos.map((veiculo) => (
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
                      onClick={() => handleEditRemoveVeiculo(veiculo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Editar Adicionar Veículo */}
      <Modal
        isOpen={isEditVeiculoModalOpen}
        onClose={() => setIsEditVeiculoModalOpen(false)}
        title="Adicionar Veículo"
      >
        <form onSubmit={handleEditSaveVeiculo} className="space-y-4">
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
                  disabled={!currentVeiculoForm.marca}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-24 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Digite o modelo"
                />
                <button
                  type="button"
                  onClick={handleOpenModeloModal}
                  disabled={!currentVeiculoForm.marca}
                  className="absolute right-2 top-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {showModeloDropdown && currentVeiculoForm.marca && modeloSearchTerm && modelosFiltrados.length > 0 && (
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input
                type="text"
                required
                value={currentVeiculoForm.placa}
                onChange={(e) => setCurrentVeiculoForm({ ...currentVeiculoForm, placa: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ano</label>
              <input
                type="text"
                value={currentVeiculoForm.ano}
                onChange={(e) => setCurrentVeiculoForm({ ...currentVeiculoForm, ano: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="2020"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input
              type="text"
              value={currentVeiculoForm.cor}
              onChange={(e) => setCurrentVeiculoForm({ ...currentVeiculoForm, cor: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Prata"
            />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditVeiculoModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
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
            <label className="block text-sm font-medium mb-1">Nome *</label>
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
        <form onSubmit={handleNewModeloSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Marca *</label>
            <select
              required
              value={newModelo.marcaId}
              onChange={(e) => setNewModelo({ ...newModelo, marcaId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!!newModelo.marcaId}
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
              value={newModelo.nome}
              onChange={(e) => setNewModelo({ ...newModelo, nome: e.target.value })}
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

