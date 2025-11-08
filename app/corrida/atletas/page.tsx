"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Users, Plus, Trophy, Mail, Phone, Edit2, Eye, Trash2 } from "lucide-react";

interface EventoProva {
  id: number;
  eventoNome: string;
  data: string;
  prova: string;
}

interface Atleta {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  categoria: "Elite" | "Amador";
  eventos: number;
  eventosProvas?: EventoProva[];
}

export default function AtletasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAtletaId, setEditingAtletaId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    categoria: "Amador" as "Elite" | "Amador",
  });

  const [editFormData, setEditFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    categoria: "Amador" as "Elite" | "Amador",
  });

  const [eventosProvas, setEventosProvas] = useState<EventoProva[]>([]);
  const [editEventosProvas, setEditEventosProvas] = useState<EventoProva[]>([]);

  const eventosDisponiveis = [
    { id: 1, nome: "Maratona de São Paulo", provas: ["5K", "10K", "21K"] },
    { id: 2, nome: "Corrida Noturna 5K", provas: ["5K"] },
    { id: 3, nome: "Ultra Trail 42K", provas: ["42K"] },
    { id: 4, nome: "Corrida Rústica 10K", provas: ["10K"] },
  ];

  const [atletas, setAtletas] = useState<Atleta[]>([
    { id: 1, nome: "João Silva", email: "joao@email.com", telefone: "(11) 99999-9999", eventos: 15, categoria: "Elite" },
    { id: 2, nome: "Maria Santos", email: "maria@email.com", telefone: "(11) 88888-8888", eventos: 12, categoria: "Elite" },
    { id: 3, nome: "Carlos Costa", email: "carlos@email.com", telefone: "(11) 77777-7777", eventos: 20, categoria: "Amador" },
    { id: 4, nome: "Ana Oliveira", email: "ana@email.com", telefone: "(11) 66666-6666", eventos: 8, categoria: "Amador" },
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const adicionarEventoProva = () => {
    setEventosProvas([
      ...eventosProvas,
      { id: eventosProvas.length + 1, eventoNome: "", data: "", prova: "" },
    ]);
  };

  const removerEventoProva = (id: number) => {
    setEventosProvas(eventosProvas.filter((ep) => ep.id !== id));
  };

  const handleEventoProvaChange = (id: number, field: keyof EventoProva, value: string) => {
    setEventosProvas((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, [field]: value } : ep))
    );
  };

  const adicionarEditEventoProva = () => {
    setEditEventosProvas([
      ...editEventosProvas,
      { id: editEventosProvas.length + 1, eventoNome: "", data: "", prova: "" },
    ]);
  };

  const removerEditEventoProva = (id: number) => {
    setEditEventosProvas(editEventosProvas.filter((ep) => ep.id !== id));
  };

  const handleEditEventoProvaChange = (id: number, field: keyof EventoProva, value: string) => {
    setEditEventosProvas((prev) =>
      prev.map((ep) => (ep.id === id ? { ...ep, [field]: value } : ep))
    );
  };

  const handleViewAtleta = (atleta: Atleta) => {
    setEditFormData({
      nome: atleta.nome,
      email: atleta.email,
      telefone: atleta.telefone,
      cpf: atleta.cpf || "",
      categoria: atleta.categoria,
    });
    setEditEventosProvas(atleta.eventosProvas || []);
    setEditingAtletaId(atleta.id);
    setIsEditMode(false);
    setIsEditModalOpen(true);
  };

  const handleEditAtleta = (atleta: Atleta) => {
    setEditFormData({
      nome: atleta.nome,
      email: atleta.email,
      telefone: atleta.telefone,
      cpf: atleta.cpf || "",
      categoria: atleta.categoria,
    });
    setEditEventosProvas(atleta.eventosProvas || []);
    setEditingAtletaId(atleta.id);
    setIsEditMode(true);
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email && !formData.telefone) {
      alert("❌ Por favor, preencha pelo menos email ou telefone!");
      return;
    }

    const novoAtleta: Atleta = {
      id: atletas.length + 1,
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      cpf: formData.cpf || undefined,
      categoria: formData.categoria,
      eventos: eventosProvas.length,
      eventosProvas: eventosProvas.filter(ep => ep.eventoNome && ep.data && ep.prova),
    };

    setAtletas([...atletas, novoAtleta]);

    setIsModalOpen(false);
    setFormData({ nome: "", email: "", telefone: "", cpf: "", categoria: "Amador" });
    setEventosProvas([]);

    alert("✅ Atleta cadastrado com sucesso!");
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAtletaId || !isEditMode) return;

    if (!editFormData.email && !editFormData.telefone) {
      alert("❌ Por favor, preencha pelo menos email ou telefone!");
      return;
    }

    setAtletas((prev) =>
      prev.map((atleta) =>
        atleta.id === editingAtletaId
          ? {
              ...atleta,
              nome: editFormData.nome,
              email: editFormData.email,
              telefone: editFormData.telefone,
              cpf: editFormData.cpf || undefined,
              categoria: editFormData.categoria,
              eventos: editEventosProvas.filter(ep => ep.eventoNome && ep.data && ep.prova).length,
              eventosProvas: editEventosProvas.filter(ep => ep.eventoNome && ep.data && ep.prova),
            }
          : atleta
      )
    );

    setIsEditModalOpen(false);
    setEditingAtletaId(null);
    setIsEditMode(false);

    alert("✅ Atleta atualizado com sucesso!");
  };

  const atletasVisiveis = atletas;
  const atletasElite = atletasVisiveis.filter(a => a.categoria === "Elite").length;
  const totalEventos = atletasVisiveis.reduce((sum, a) => sum + a.eventos, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atletas</h1>
          <p className="text-muted-foreground">Gerenciamento de atletas cadastrados</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Atleta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Atletas</p>
                <p className="text-2xl font-bold">{atletasVisiveis.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categoria Elite</p>
                <p className="text-2xl font-bold">{atletasElite}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Eventos</p>
                <p className="text-2xl font-bold">{totalEventos}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atletas Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atletasVisiveis.map((atleta) => (
              <div
                key={atleta.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => handleViewAtleta(atleta)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{atleta.nome}</p>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        {atleta.categoria}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {atleta.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {atleta.email}
                        </span>
                      )}
                      {atleta.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {atleta.telefone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <p className="text-sm text-muted-foreground">Eventos</p>
                    <p className="font-semibold">{atleta.eventos}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewAtleta(atleta)}
                      className="h-8 w-8 p-0"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAtleta(atleta)}
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
        title="Novo Atleta"
        width="60vw"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                placeholder="Nome completo"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Categoria *</label>
              <select
                value={formData.categoria}
                onChange={(e) => handleInputChange("categoria", e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                required
              >
                <option value="Amador">Amador</option>
                <option value="Elite">Elite</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Eventos e Provas</h3>
              <Button type="button" onClick={adicionarEventoProva} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Evento
              </Button>
            </div>

            <div className="space-y-4">
              {eventosProvas.map((ep, index) => (
                <div key={ep.id} className="rounded-lg border border-border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-medium">Evento {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerEventoProva(ep.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium">Evento *</label>
                      <select
                        value={ep.eventoNome}
                        onChange={(e) =>
                          handleEventoProvaChange(ep.id, "eventoNome", e.target.value)
                        }
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                      >
                        <option value="">Selecione...</option>
                        {eventosDisponiveis.map((evento) => (
                          <option key={evento.id} value={evento.nome}>
                            {evento.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Prova *</label>
                      <select
                        value={ep.prova}
                        onChange={(e) => handleEventoProvaChange(ep.id, "prova", e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                        disabled={!ep.eventoNome}
                      >
                        <option value="">Selecione...</option>
                        {eventosDisponiveis
                          .find((e) => e.nome === ep.eventoNome)
                          ?.provas.map((prova) => (
                            <option key={prova} value={prova}>
                              {prova}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Data *</label>
                      <input
                        type="date"
                        value={ep.data}
                        onChange={(e) => handleEventoProvaChange(ep.id, "data", e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {eventosProvas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum evento cadastrado. Clique em &quot;Adicionar Evento&quot; para começar.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEventosProvas([]);
            }}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Atleta</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAtletaId(null);
          setIsEditMode(false);
        }}
        title={isEditMode ? "Editar Atleta" : "Visualizar Atleta"}
        width="60vw"
      >
        <div onClick={(e) => e.stopPropagation()}>
          <form
            onSubmit={(e) => {
              if (isEditMode) {
                handleUpdateSubmit(e);
              } else {
                e.preventDefault();
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <input
                  type="text"
                  value={editFormData.nome}
                  onChange={(e) => handleEditInputChange("nome", e.target.value)}
                  placeholder="Nome completo"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  required={isEditMode}
                  disabled={!isEditMode}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditInputChange("email", e.target.value)}
                    placeholder="email@exemplo.com"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                    disabled={!isEditMode}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <input
                    type="tel"
                    value={editFormData.telefone}
                    onChange={(e) => handleEditInputChange("telefone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                    disabled={!isEditMode}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">CPF</label>
                <input
                  type="text"
                  value={editFormData.cpf}
                  onChange={(e) => handleEditInputChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  disabled={!isEditMode}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Categoria *</label>
                <select
                  value={editFormData.categoria}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleEditInputChange("categoria", e.target.value);
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                  required={isEditMode}
                  disabled={!isEditMode}
                >
                  <option value="Amador">Amador</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Eventos e Provas</h3>
                {isEditMode && (
                  <Button type="button" onClick={adicionarEditEventoProva} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Evento
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {editEventosProvas.map((ep, index) => (
                  <div key={ep.id} className="rounded-lg border border-border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-medium">Evento {index + 1}</h4>
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerEditEventoProva(ep.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="text-sm font-medium">Evento *</label>
                        <select
                          value={ep.eventoNome}
                          onChange={(e) =>
                            handleEditEventoProvaChange(ep.id, "eventoNome", e.target.value)
                          }
                          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                          disabled={!isEditMode}
                        >
                          <option value="">Selecione...</option>
                          {eventosDisponiveis.map((evento) => (
                            <option key={evento.id} value={evento.nome}>
                              {evento.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Prova *</label>
                        <select
                          value={ep.prova}
                          onChange={(e) => handleEditEventoProvaChange(ep.id, "prova", e.target.value)}
                          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                          disabled={!isEditMode || !ep.eventoNome}
                        >
                          <option value="">Selecione...</option>
                          {eventosDisponiveis
                            .find((e) => e.nome === ep.eventoNome)
                            ?.provas.map((prova) => (
                              <option key={prova} value={prova}>
                                {prova}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Data *</label>
                        <input
                          type="date"
                          value={ep.data}
                          onChange={(e) => handleEditEventoProvaChange(ep.id, "data", e.target.value)}
                          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
                          disabled={!isEditMode}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(editEventosProvas.length === 0 && isEditMode) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum evento cadastrado. Clique em &quot;Adicionar Evento&quot; para começar.
                  </p>
                )}
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
                      setEditingAtletaId(null);
                      setIsEditMode(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Atualizar Atleta</Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingAtletaId(null);
                    }}
                  >
                    Fechar
                  </Button>
                  <Button type="button" onClick={() => setIsEditMode(true)}>
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
