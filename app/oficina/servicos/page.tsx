"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Wrench, Plus, Trash2, Edit2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { Marca, Modelo } from "../types";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { servicoService, type ServicoAPI } from "@/lib/services/servico.service";

export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  tempoEstimadoHoras: number; // Tempo em horas (ex: 1.5 = 1h30min)
  tipoAplicacao: "GERAL" | "ESPECIFICO"; // Geral para todos veículos ou específico para marca/modelo
  marcaId?: number | null; // Se específico, qual marca
  modeloId?: number | null; // Se específico, qual modelo
}

// Marcas e modelos serão carregados do backend quando os endpoints estiverem disponíveis
// Por enquanto, ficam vazios


export default function ServicosPage() {
  const api = useApi();
  const { token } = useAuth();
  const empresaId = api.empresaId;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingServicoId, setEditingServicoId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tempoEstimadoHoras: "",
    tipoAplicacao: "GERAL" as "GERAL" | "ESPECIFICO",
    marcaId: "",
    modeloId: "",
  });

  const [editFormData, setEditFormData] = useState({
    nome: "",
    descricao: "",
    tempoEstimadoHoras: "",
    tipoAplicacao: "GERAL" as "GERAL" | "ESPECIFICO",
    marcaId: "",
    modeloId: "",
  });

  const [servicos, setServicos] = useState<Servico[]>([]); // Dados carregados do backend
  // Removido dados mockados - servicos agora vem do backend
  /*
  const [servicos, setServicos] = useState<Servico[]>([
    {
      id: 1,
      nome: "Troca de Óleo",
      descricao: "Troca de óleo do motor com filtro",
      tempoEstimadoHoras: 0.5,
      tipoAplicacao: "GERAL",
    },
    {
      id: 2,
      nome: "Troca de Velas",
      descricao: "Troca completa de velas de ignição",
      tempoEstimadoHoras: 1.0,
      tipoAplicacao: "GERAL",
    },
    {
      id: 3,
      nome: "Revisão Preventiva",
      descricao: "Revisão completa do veículo",
      tempoEstimadoHoras: 2.5,
      tipoAplicacao: "GERAL",
    },
  ]);
  */

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tempoHoras = parseFloat(formData.tempoEstimadoHoras);

    const novoServico: Servico = {
      id: servicos.length + 1,
      nome: formData.nome,
      descricao: formData.descricao,
      tempoEstimadoHoras: tempoHoras,
      tipoAplicacao: formData.tipoAplicacao,
      marcaId: formData.tipoAplicacao === "ESPECIFICO" && formData.marcaId ? parseInt(formData.marcaId) : null,
      modeloId: formData.tipoAplicacao === "ESPECIFICO" && formData.modeloId ? parseInt(formData.modeloId) : null,
    };

    setServicos([...servicos, novoServico]);
    setIsModalOpen(false);
    setFormData({
      nome: "",
      descricao: "",
      tempoEstimadoHoras: "",
      tipoAplicacao: "GERAL",
      marcaId: "",
      modeloId: "",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServicoId) return;

    const tempoHoras = parseFloat(editFormData.tempoEstimadoHoras);

    const servicoAtualizado: Servico = {
      id: editingServicoId,
      nome: editFormData.nome,
      descricao: editFormData.descricao,
      tempoEstimadoHoras: tempoHoras,
      tipoAplicacao: editFormData.tipoAplicacao,
      marcaId: editFormData.tipoAplicacao === "ESPECIFICO" && editFormData.marcaId ? parseInt(editFormData.marcaId) : null,
      modeloId: editFormData.tipoAplicacao === "ESPECIFICO" && editFormData.modeloId ? parseInt(editFormData.modeloId) : null,
    };

    setServicos(servicos.map(s => s.id === editingServicoId ? servicoAtualizado : s));
    setIsEditModalOpen(false);
    setEditingServicoId(null);
  };

  const handleEdit = (servico: Servico) => {
    setEditingServicoId(servico.id);
    setEditFormData({
      nome: servico.nome,
      descricao: servico.descricao,
      tempoEstimadoHoras: servico.tempoEstimadoHoras.toString(),
      tipoAplicacao: servico.tipoAplicacao,
      marcaId: servico.marcaId?.toString() || "",
      modeloId: servico.modeloId?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      setServicos(servicos.filter((s) => s.id !== id));
    }
  };

  const modelosFiltrados = editFormData.marcaId
    ? [] // TODO: Filtrar modelos quando endpoint de modelos estiver disponível
    : formData.marcaId
    ? [] // TODO: Filtrar modelos quando endpoint de modelos estiver disponível
    : [];

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  const formatarTempo = (horas: number): string => {
    const horasInt = Math.floor(horas);
    const minutos = Math.round((horas - horasInt) * 60);
    if (horasInt === 0) {
      return `${minutos}min`;
    }
    if (minutos === 0) {
      return `${horasInt}h`;
    }
    return `${horasInt}h${minutos}min`;
  };

  // Calcular paginação
  const totalPaginas = Math.ceil(servicos.length / itensPorPagina) || 1;
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const servicosPaginaAtual = servicos.slice(indiceInicio, indiceFim);

  // Ajustar página atual se estiver fora do range válido
  useEffect(() => {
    if (paginaAtual > totalPaginas && totalPaginas > 0) {
      setPaginaAtual(totalPaginas);
    }
  }, [totalPaginas, paginaAtual]);

  // Ref para garantir que os dados sejam carregados apenas uma vez
  const dadosCarregados = useRef(false);
  
  // Carregar serviços do backend apenas quando a rota for acessada
  useEffect(() => {
    // Evita carregar duas vezes (mesmo em modo desenvolvimento do React)
    if (dadosCarregados.current) return;
    if (!empresaId || !token) return;
    
    let cancelado = false;
    dadosCarregados.current = true;
    
    async function carregarServicos() {
      if (!empresaId || !token) return;
      
      try {
        const pagina = await servicoService.getAll(api, { page: 0, size: 1000 });
        if (cancelado) return;
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
        if (cancelado) return;
        console.error("Erro ao carregar serviços:", error);
        setServicos([]);
      }
    }
    
    carregarServicos();
    
    return () => {
      cancelado = true;
      // Reset apenas se empresaId ou token mudarem
      if (!empresaId || !token) {
        dadosCarregados.current = false;
      }
    };
  }, [empresaId, token]); // Usa apenas empresaId e token, não o objeto api inteiro

  const handleItensPorPaginaChange = (novaQuantidade: number) => {
    setItensPorPagina(novaQuantidade);
    setPaginaAtual(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastro de Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos pela oficina</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Serviços</CardTitle>
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
            {servicosPaginaAtual.length > 0 ? (
              servicosPaginaAtual.map((servico) => {
              const marca = null; // TODO: Buscar marca quando endpoint estiver disponível
              const modelo = null; // TODO: Buscar modelo quando endpoint estiver disponível
              
              return (
                <div
                  key={servico.id}
                  className="rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Wrench className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-lg">{servico.nome}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {servico.tipoAplicacao === "GERAL" ? "Geral" : `${marca?.nome || ""} ${modelo?.nome || ""}`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{servico.descricao}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <strong className="text-foreground">Tempo estimado:</strong> {formatarTempo(servico.tempoEstimadoHoras)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(servico)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(servico.id)}
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
                <p className="text-muted-foreground">Nenhum serviço cadastrado</p>
              </div>
            )}
          </div>

          {/* Controles de Paginação */}
          {servicos.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {indiceInicio + 1} até {Math.min(indiceFim, servicos.length)} de {servicos.length} serviços
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

      {/* Modal de Novo Serviço */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Serviço"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Serviço *</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Troca de Óleo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Descreva o serviço..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tempo Estimado (horas) *</label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              required
              value={formData.tempoEstimadoHoras}
              onChange={(e) => handleInputChange("tempoEstimadoHoras", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ex: 1.5 = 1h30min, 0.5 = 30min. O cálculo do valor será feito na Ordem de Serviço usando o funcionário e valor/hora definidos lá.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Aplicação *</label>
            <select
              required
              value={formData.tipoAplicacao}
              onChange={(e) => handleInputChange("tipoAplicacao", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="GERAL">Geral (Todos os veículos)</option>
              <option value="ESPECIFICO">Específico (Marca/Modelo)</option>
            </select>
          </div>

          {formData.tipoAplicacao === "ESPECIFICO" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <select
                  value={formData.marcaId}
                  onChange={(e) => {
                    handleInputChange("marcaId", e.target.value);
                    handleInputChange("modeloId", ""); // Reset modelo ao trocar marca
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione uma marca</option>
                  {[].map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <select
                  value={formData.modeloId}
                  onChange={(e) => handleInputChange("modeloId", e.target.value)}
                  disabled={!formData.marcaId}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="">Selecione um modelo</option>
                  {modelosFiltrados.map((modelo) => (
                    <option key={modelo.id} value={modelo.id}>
                      {modelo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Serviço"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Serviço *</label>
            <input
              type="text"
              required
              value={editFormData.nome}
              onChange={(e) => handleEditInputChange("nome", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={editFormData.descricao}
              onChange={(e) => handleEditInputChange("descricao", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tempo Estimado (horas) *</label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              required
              value={editFormData.tempoEstimadoHoras}
              onChange={(e) => handleEditInputChange("tempoEstimadoHoras", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ex: 1.5 = 1h30min, 0.5 = 30min. O cálculo do valor será feito na Ordem de Serviço usando o funcionário e valor/hora definidos lá.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Aplicação *</label>
            <select
              required
              value={editFormData.tipoAplicacao}
              onChange={(e) => handleEditInputChange("tipoAplicacao", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="GERAL">Geral (Todos os veículos)</option>
              <option value="ESPECIFICO">Específico (Marca/Modelo)</option>
            </select>
          </div>

          {editFormData.tipoAplicacao === "ESPECIFICO" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marca</label>
                <select
                  value={editFormData.marcaId}
                  onChange={(e) => {
                    handleEditInputChange("marcaId", e.target.value);
                    handleEditInputChange("modeloId", ""); // Reset modelo ao trocar marca
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione uma marca</option>
                  {[].map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <select
                  value={editFormData.modeloId}
                  onChange={(e) => handleEditInputChange("modeloId", e.target.value)}
                  disabled={!editFormData.marcaId}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="">Selecione um modelo</option>
                  {modelosFiltrados.map((modelo) => (
                    <option key={modelo.id} value={modelo.id}>
                      {modelo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

