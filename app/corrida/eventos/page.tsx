"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Calendar, Plus, MapPin, Clock, Users, Trash2, Edit2, Eye } from "lucide-react";

export enum StatusEvento {
  ANDAMENTO = "Andamento",
  FINALIZADO = "Finalizado",
  EXCLUIDO = "Excluído"
}

interface Prova {
  id: number;
  distancia: string;
  preco: string;
  vagas: string;
}

interface Evento {
  id: number;
  nome: string;
  data: string;
  local: string;
  distancias: string;
  inscritos: number;
  vagas: number;
  status: StatusEvento;
  provas?: Prova[];
}

export default function EventosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEventoId, setEditingEventoId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    data: "",
    local: "",
    descricao: "",
  });

  const [editFormData, setEditFormData] = useState({
    nome: "",
    data: "",
    local: "",
    descricao: "",
    status: "",
  });

  const [provas, setProvas] = useState<Prova[]>([
    { id: 1, distancia: "", preco: "", vagas: "" },
  ]);

  const [editProvas, setEditProvas] = useState<Prova[]>([
    { id: 1, distancia: "", preco: "", vagas: "" },
  ]);

  const [eventos, setEventos] = useState<Evento[]>([
    { id: 1, nome: "Maratona de São Paulo", data: "15/03/2024", local: "Parque Ibirapuera", distancias: "5K, 10K, 21K", inscritos: 450, vagas: 500, status: StatusEvento.ANDAMENTO },
    { id: 2, nome: "Corrida Noturna 5K", data: "22/03/2024", local: "Avenida Paulista", distancias: "5K", inscritos: 120, vagas: 200, status: StatusEvento.ANDAMENTO },
    { id: 3, nome: "Ultra Trail 42K", data: "01/04/2024", local: "Serra da Cantareira", distancias: "42K", inscritos: 85, vagas: 100, status: StatusEvento.ANDAMENTO },
    { id: 4, nome: "Corrida Rústica 10K", data: "10/02/2024", local: "Parque Villa-Lobos", distancias: "10K", inscritos: 250, vagas: 250, status: StatusEvento.FINALIZADO },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvaChange = (
    id: number,
    field: keyof Prova,
    value: string
  ) => {
    setProvas((prev) =>
      prev.map((prova) =>
        prova.id === id ? { ...prova, [field]: value } : prova
      )
    );
  };

  const addProva = () => {
    setProvas((prev) => [
      ...prev,
      { id: prev.length + 1, distancia: "", preco: "", vagas: "" },
    ]);
  };

  const removeProva = (id: number) => {
    if (provas.length > 1) {
      setProvas((prev) => prev.filter((prova) => prova.id !== id));
    }
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditProvaChange = (
    id: number,
    field: keyof Prova,
    value: string
  ) => {
    setEditProvas((prev) =>
      prev.map((prova) =>
        prova.id === id ? { ...prova, [field]: value } : prova
      )
    );
  };

  const addEditProva = () => {
    setEditProvas((prev) => [
      ...prev,
      { id: prev.length + 1, distancia: "", preco: "", vagas: "" },
    ]);
  };

  const removeEditProva = (id: number) => {
    if (editProvas.length > 1) {
      setEditProvas((prev) => prev.filter((prova) => prova.id !== id));
    }
  };

  const handleViewEvento = (evento: Evento) => {
    const dataParts = evento.data.split('/');
    const dataFormatted = `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`;
    
    setEditFormData({
      nome: evento.nome,
      data: dataFormatted,
      local: evento.local,
      descricao: "",
      status: evento.status,
    });

    if (evento.provas && evento.provas.length > 0) {
      setEditProvas(evento.provas);
    } else {
      const distanciasArray = evento.distancias.split(',').map(d => d.trim());
      const provasArray = distanciasArray.map((dist, index) => ({
        id: index + 1,
        distancia: dist,
        preco: "",
        vagas: "",
      }));
      setEditProvas(provasArray.length > 0 ? provasArray : [{ id: 1, distancia: "", preco: "", vagas: "" }]);
    }

    setEditingEventoId(evento.id);
    setIsEditMode(false);
    setIsEditModalOpen(true);
  };

  const handleEditEvento = (evento: Evento) => {
    const dataParts = evento.data.split('/');
    const dataFormatted = `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`;
    
    setEditFormData({
      nome: evento.nome,
      data: dataFormatted,
      local: evento.local,
      descricao: "",
      status: evento.status,
    });

    if (evento.provas && evento.provas.length > 0) {
      setEditProvas(evento.provas);
    } else {
      const distanciasArray = evento.distancias.split(',').map(d => d.trim());
      const provasArray = distanciasArray.map((dist, index) => ({
        id: index + 1,
        distancia: dist,
        preco: "",
        vagas: "",
      }));
      setEditProvas(provasArray.length > 0 ? provasArray : [{ id: 1, distancia: "", preco: "", vagas: "" }]);
    }

    setEditingEventoId(evento.id);
    setIsEditMode(true);
    setIsEditModalOpen(true);
  };

  const alterarStatusEvento = (eventoId: number, novoStatus: StatusEvento) => {
    setEventos((prev) =>
      prev.map((evento) =>
        evento.id === eventoId ? { ...evento, status: novoStatus } : evento
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Evento:", formData);
    console.log("Provas:", provas);
    
    const dataEvento = new Date(formData.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataEvento < hoje) {
      alert("❌ A data do evento não pode ser no passado!");
      return;
    }
    
    const precosNegativos = provas.filter(p => parseFloat(p.preco) < 0);
    if (precosNegativos.length > 0) {
      alert("❌ Os preços não podem ser negativos!");
      return;
    }
    
    const provasIncompletas = provas.filter(p => !p.distancia || !p.preco || !p.vagas);
    if (provasIncompletas.length > 0) {
      alert("❌ Por favor, complete todas as informações das provas!");
      return;
    }
    
    const dataFormatada = formData.data.split('-').reverse().join('/');
    
    const distancias = provas.map(p => p.distancia).join(', ');
    
    const totalVagas = provas.reduce((sum, p) => sum + parseInt(p.vagas || '0'), 0);
    
    const novoEvento: Evento = {
      id: eventos.length + 1,
      nome: formData.nome,
      data: dataFormatada,
      local: formData.local,
      distancias: distancias,
      inscritos: 0,
      vagas: totalVagas,
      status: StatusEvento.ANDAMENTO,
      provas: provas
    };
    
    setEventos([...eventos, novoEvento]);
    
    setIsModalOpen(false);
    setFormData({ nome: "", data: "", local: "", descricao: "" });
    setProvas([{ id: 1, distancia: "", preco: "", vagas: "" }]);
    
    alert("✅ Evento criado com sucesso!");
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEventoId || !isEditMode) return;
    
    const dataEvento = new Date(editFormData.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const provasComDados = editProvas.some(p => p.preco && p.vagas);
    const provasCompletas = editProvas.every(p => p.distancia && (provasComDados ? (p.preco && p.vagas) : true));
    
    const precosNegativos = editProvas.filter(p => p.preco && parseFloat(p.preco) < 0);
    if (precosNegativos.length > 0) {
      alert("❌ Os preços não podem ser negativos!");
      return;
    }
    
    if (!provasCompletas) {
      if (provasComDados) {
        alert("❌ Por favor, complete todas as informações das provas!");
        return;
      }
    }
    
    const eventoOriginal = eventos.find(e => e.id === editingEventoId);
    
    const dataFormatada = editFormData.data.split('-').reverse().join('/');
    
    const distancias = editProvas.some(p => p.distancia) 
      ? editProvas.filter(p => p.distancia).map(p => p.distancia).join(', ')
      : eventoOriginal?.distancias || '';
    
    const totalVagas = editProvas.reduce((sum, p) => {
      const vagas = parseInt(p.vagas || '0');
      return isNaN(vagas) ? sum : sum + vagas;
    }, 0);
    
    setEventos((prev) => 
      prev.map((evento) =>
        evento.id === editingEventoId
          ? {
              id: evento.id,
              nome: editFormData.nome,
              data: dataFormatada,
              local: editFormData.local,
              distancias: distancias,
              inscritos: evento.inscritos,
              vagas: totalVagas > 0 ? totalVagas : evento.vagas,
              status: editFormData.status as StatusEvento,
              provas: editProvas,
            }
          : evento
      )
    );
    
    setIsEditModalOpen(false);
    setEditingEventoId(null);
    setIsEditMode(false);
    
    alert("✅ Evento atualizado com sucesso!");
  };

  const eventosVisiveis = eventos.filter(e => e.status !== StatusEvento.EXCLUIDO);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
            <p className="text-muted-foreground">Gerenciamento de eventos de corrida</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Eventos</p>
                  <p className="text-2xl font-bold">{eventosVisiveis.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eventos Em Andamento</p>
                  <p className="text-2xl font-bold">{eventosVisiveis.filter(e => e.status === StatusEvento.ANDAMENTO).length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eventos Finalizados</p>
                  <p className="text-2xl font-bold">{eventosVisiveis.filter(e => e.status === StatusEvento.FINALIZADO).length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900/20">
                  <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inscritos</p>
                  <p className="text-2xl font-bold">{eventosVisiveis.reduce((sum, e) => sum + e.inscritos, 0)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventosVisiveis.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div 
                    className="flex items-start gap-4 cursor-pointer flex-1"
                    onClick={() => handleViewEvento(evento)}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{evento.nome}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {evento.data}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {evento.local}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Distâncias: {evento.distancias}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <p className="text-sm text-muted-foreground">Inscrições</p>
                      <p className="font-semibold">{evento.inscritos}/{evento.vagas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <select
                        value={evento.status}
                        onChange={(e) => alterarStatusEvento(evento.id, e.target.value as StatusEvento)}
                        className={`status-select font-semibold rounded-full px-3 py-1 border-none cursor-pointer text-xs ${
                          evento.status === StatusEvento.ANDAMENTO
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : evento.status === StatusEvento.FINALIZADO
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        <option value={StatusEvento.ANDAMENTO}>Andamento</option>
                        <option value={StatusEvento.FINALIZADO}>Finalizado</option>
                        <option value={StatusEvento.EXCLUIDO}>Excluído</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEvento(evento)}
                        className="h-8 w-8 p-0"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEvento(evento)}
                        className="h-8 w-8 p-0"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Evento"
        width="70vw"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Informações do Evento</h3>

            <div>
              <label className="text-sm font-medium">Nome do Evento *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Ex: Maratona de São Paulo"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Data *</label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleInputChange("data", e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Local *</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.local}
                    onChange={(e) => handleInputChange("local", e.target.value)}
                    placeholder="Ex: Parque Ibirapuera"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva o evento..."
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Provas do Evento</h3>
              <Button type="button" onClick={addProva} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Prova
              </Button>
            </div>

            <div className="space-y-4">
              {provas.map((prova, index) => (
                <div key={prova.id} className="rounded-lg border border-border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium">Prova {index + 1}</h4>
                    {provas.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProva(prova.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium">Distância *</label>
                      <input
                        type="text"
                        value={prova.distancia}
                        onChange={(e) =>
                          handleProvaChange(prova.id, "distancia", e.target.value)
                        }
                        placeholder="Ex: 5K, 10K, 21K"
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Preço (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={prova.preco}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= 0 || e.target.value === '') {
                            handleProvaChange(prova.id, "preco", e.target.value);
                          }
                        }}
                        placeholder="89.90"
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Vagas *</label>
                      <input
                        type="number"
                        min="1"
                        value={prova.vagas}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 1 || e.target.value === '') {
                            handleProvaChange(prova.id, "vagas", e.target.value);
                          }
                        }}
                        placeholder="500"
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Evento</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEventoId(null);
          setIsEditMode(false);
        }}
        title={isEditMode ? "Editar Evento" : "Visualizar Evento"}
        width="70vw"
      >
        <div onClick={(e) => e.stopPropagation()}>
          <form onSubmit={(e) => {
            if (isEditMode) {
              handleUpdateSubmit(e);
            } else {
              e.preventDefault();
            }
          }} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Informações do Evento</h3>

            <div>
              <label className="text-sm font-medium">Nome do Evento *</label>
              <input
                type="text"
                value={editFormData.nome}
                onChange={(e) => handleEditInputChange("nome", e.target.value)}
                placeholder="Ex: Maratona de São Paulo"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                required={isEditMode}
                disabled={!isEditMode}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Data *</label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={editFormData.data}
                    onChange={(e) => handleEditInputChange("data", e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 pl-10"
                    min={isEditMode ? new Date().toISOString().split('T')[0] : undefined}
                    required={isEditMode}
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Local *</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={editFormData.local}
                    onChange={(e) => handleEditInputChange("local", e.target.value)}
                    placeholder="Ex: Parque Ibirapuera"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 pl-10"
                    required={isEditMode}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                value={editFormData.descricao}
                onChange={(e) => handleEditInputChange("descricao", e.target.value)}
                placeholder="Descreva o evento..."
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                disabled={!isEditMode}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Status *</label>
              <select
                value={editFormData.status}
                onChange={(e) => {
                  e.stopPropagation();
                  handleEditInputChange("status", e.target.value);
                }}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                required={isEditMode}
                disabled={!isEditMode}
              >
                <option value={StatusEvento.ANDAMENTO}>Andamento</option>
                <option value={StatusEvento.FINALIZADO}>Finalizado</option>
                <option value={StatusEvento.EXCLUIDO}>Excluído</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Provas do Evento</h3>
              {isEditMode && (
                <Button type="button" onClick={addEditProva} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Prova
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {editProvas.map((prova, index) => (
                <div key={prova.id} className="rounded-lg border border-border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium">Prova {index + 1}</h4>
                    {isEditMode && editProvas.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEditProva(prova.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium">Distância *</label>
                      <input
                        type="text"
                        value={prova.distancia}
                        onChange={(e) =>
                          handleEditProvaChange(prova.id, "distancia", e.target.value)
                        }
                        placeholder="Ex: 5K, 10K, 21K"
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                        required={isEditMode}
                        disabled={!isEditMode}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Preço (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={prova.preco}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= 0 || e.target.value === '') {
                            handleEditProvaChange(prova.id, "preco", e.target.value);
                          }
                        }}
                        placeholder="89.90"
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                        required={isEditMode}
                        disabled={!isEditMode}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Vagas *</label>
                      <input
                        type="number"
                        min="1"
                        value={prova.vagas}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 1 || e.target.value === '') {
                            handleEditProvaChange(prova.id, "vagas", e.target.value);
                          }
                        }}
                        placeholder="500"
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                        required={isEditMode}
                        disabled={!isEditMode}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-border pt-4">
            {isEditMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingEventoId(null);
                    setIsEditMode(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Atualizar Evento</Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingEventoId(null);
                  }}
                >
                  Fechar
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                >
                  Editar
                </Button>
              </>
            )}
          </div>
        </form>
        </div>
      </Modal>
      </div>
  );
}
