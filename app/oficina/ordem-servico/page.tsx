"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ClipboardCheck, Plus, Wrench, AlertCircle, CheckCircle, Clock, DollarSign, Trash2, Edit2, Eye } from "lucide-react";

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
  veiculo: string;
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
  const [editingOrdemId, setEditingOrdemId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    cliente: "",
    telefone: "",
    veiculo: "",
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
    veiculo: "",
    placa: "",
    ano: "",
    cor: "",
    descricaoProblema: "",
    prioridade: Prioridade.BAIXA,
    status: StatusOrdemServico.ORCAMENTO,
    mecanico: "",
    observacoes: "",
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
      veiculo: "Honda Civic",
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
      veiculo: "Toyota Corolla",
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
      veiculo: "Chevrolet Onix",
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
      veiculo: formData.veiculo,
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
      veiculo: "",
      placa: "",
      ano: "",
      cor: "",
      descricaoProblema: "",
      prioridade: Prioridade.BAIXA,
      mecanico: "",
      observacoes: "",
    });
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
      veiculo: editFormData.veiculo,
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
      veiculo: ordem.veiculo,
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
      veiculo: ordem.veiculo,
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
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            <strong className="text-foreground">Veículo:</strong> {ordem.veiculo}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cliente *</label>
              <input
                type="text"
                required
                value={formData.cliente}
                onChange={(e) => handleInputChange("cliente", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Veículo *</label>
              <input
                type="text"
                required
                value={formData.veiculo}
                onChange={(e) => handleInputChange("veiculo", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input
                type="text"
                required
                value={formData.placa}
                onChange={(e) => handleInputChange("placa", e.target.value.toUpperCase())}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ano *</label>
              <input
                type="text"
                required
                value={formData.ano}
                onChange={(e) => handleInputChange("ano", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cor *</label>
              <input
                type="text"
                required
                value={formData.cor}
                onChange={(e) => handleInputChange("cor", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
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

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-1">Mecânico Responsável *</label>
              <input
                type="text"
                required
                value={formData.mecanico}
                onChange={(e) => handleInputChange("mecanico", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Veículo *</label>
              <input
                type="text"
                required
                value={editFormData.veiculo}
                onChange={(e) => handleEditInputChange("veiculo", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mecânico Responsável *</label>
              <input
                type="text"
                required
                value={editFormData.mecanico}
                onChange={(e) => handleEditInputChange("mecanico", e.target.value)}
                disabled={!isEditMode}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              />
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
    </div>
  );
}

