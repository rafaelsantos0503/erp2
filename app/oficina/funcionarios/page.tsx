"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Users, Plus, Trash2, Edit2 } from "lucide-react";
import type { Funcionario, Endereco } from "../types";

const funcionariosIniciais: Funcionario[] = [
  { id: 1, nome: "Carlos Santos", telefone: "(11) 95555-5555", email: "carlos@oficina.com", tipo: "Mecanico", tipoContratacao: "CLT", valorDespesa: 3500, cpf: "123.456.789-00", dataAdmissao: "01/01/2023", endereco: { cep: "01310-100", logradouro: "Av. Paulista", numero: "1000", complemento: "Apto 101", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP" } },
  { id: 2, nome: "Roberto Lima", telefone: "(11) 94444-4444", email: "roberto@oficina.com", tipo: "Mecanico", tipoContratacao: "CLT", valorDespesa: 3200, cpf: "234.567.890-11", dataAdmissao: "15/03/2023", endereco: { cep: "02010-000", logradouro: "Rua Augusta", numero: "500", bairro: "Consolação", cidade: "São Paulo", estado: "SP" } },
  { id: 3, nome: "José Ferreira", telefone: "(11) 93333-3333", email: "jose@oficina.com", tipo: "Mecanico", tipoContratacao: "PJ", valorDespesa: 2800, cpf: "345.678.901-22", dataAdmissao: "01/06/2023" },
  { id: 4, nome: "Ana Silva", telefone: "(11) 92222-2222", email: "ana@oficina.com", tipo: "Recepcionista", tipoContratacao: "CLT", valorDespesa: 2200, cpf: "456.789.012-33", dataAdmissao: "01/02/2024" },
  { id: 5, nome: "Maria Costa", telefone: "(11) 91111-1111", email: "maria@oficina.com", tipo: "Recepcionista", tipoContratacao: "CLT", valorDespesa: 2200, cpf: "567.890.123-44", dataAdmissao: "01/04/2024" },
  { id: 6, nome: "João Pereira", telefone: "(11) 90000-0000", email: "joao@oficina.com", tipo: "Gerente", tipoContratacao: "CLT", valorDespesa: 5000, cpf: "678.901.234-55", dataAdmissao: "01/01/2022" },
];

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosIniciais);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    tipo: "Mecanico" as Funcionario["tipo"],
    tipoContratacao: "CLT" as Funcionario["tipoContratacao"],
    valorDespesa: "",
    cpf: "",
    dataAdmissao: "",
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    } as Endereco,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEnderecoChange = (field: keyof Endereco, value: string) => {
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
  };

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
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
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleCepBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    buscarCep(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = funcionarios.length + 1;
    const novoFuncionario: Funcionario = {
      id: novoId,
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email,
      tipo: formData.tipo,
      tipoContratacao: formData.tipoContratacao,
      valorDespesa: formData.valorDespesa ? parseFloat(formData.valorDespesa) : undefined,
      cpf: formData.cpf,
      dataAdmissao: formData.dataAdmissao,
      endereco: formData.endereco,
    };

    setFuncionarios([...funcionarios, novoFuncionario]);
    setIsModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const funcionarioAtualizado: Funcionario = {
      id: editingId,
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email,
      tipo: formData.tipo,
      tipoContratacao: formData.tipoContratacao,
      valorDespesa: formData.valorDespesa ? parseFloat(formData.valorDespesa) : undefined,
      cpf: formData.cpf,
      dataAdmissao: formData.dataAdmissao,
      endereco: formData.endereco,
    };

    setFuncionarios(funcionarios.map((f) => (f.id === editingId ? funcionarioAtualizado : f)));
    setIsEditModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      tipo: "Mecanico",
      tipoContratacao: "CLT",
      valorDespesa: "",
      cpf: "",
      dataAdmissao: "",
      endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      setFuncionarios(funcionarios.filter((f) => f.id !== id));
    }
  };

  const handleEdit = (funcionario: Funcionario) => {
    setEditingId(funcionario.id);
    setFormData({
      nome: funcionario.nome,
      telefone: funcionario.telefone,
      email: funcionario.email || "",
      tipo: funcionario.tipo,
      tipoContratacao: funcionario.tipoContratacao,
      valorDespesa: funcionario.valorDespesa?.toString() || "",
      cpf: funcionario.cpf || "",
      dataAdmissao: funcionario.dataAdmissao || "",
      endereco: funcionario.endereco || {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      },
    });
    setIsEditModalOpen(true);
  };

  const handleOpenNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">Cadastro e gestão de funcionários</p>
        </div>
        <Button onClick={handleOpenNewModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Lista de Funcionários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Telefone</th>
                  <th className="text-left p-3 text-sm font-medium">Email</th>
                  <th className="text-left p-3 text-sm font-medium">Tipo</th>
                  <th className="text-left p-3 text-sm font-medium">Contratação</th>
                  <th className="text-right p-3 text-sm font-medium">Despesa</th>
                  <th className="text-right p-3 text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.map((funcionario) => (
                  <tr key={funcionario.id} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="p-3">
                      <div className="font-medium">{funcionario.nome}</div>
                      {funcionario.cpf && (
                        <div className="text-xs text-muted-foreground">{funcionario.cpf}</div>
                      )}
                    </td>
                    <td className="p-3">{funcionario.telefone}</td>
                    <td className="p-3">{funcionario.email || "-"}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {funcionario.tipo}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-secondary">
                        {funcionario.tipoContratacao}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {funcionario.valorDespesa ? (
                        `R$ ${funcionario.valorDespesa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(funcionario)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(funcionario.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Novo Funcionário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Funcionário"
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
              placeholder="Nome completo"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Função *</label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Mecanico">Mecânico</option>
                <option value="Recepcionista">Recepcionista</option>
                <option value="Gerente">Gerente</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Contratação *</label>
              <select
                required
                value={formData.tipoContratacao}
                onChange={(e) => handleInputChange("tipoContratacao", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor de Despesa (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valorDespesa}
                onChange={(e) => handleInputChange("valorDespesa", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Admissão</label>
              <input
                type="text"
                value={formData.dataAdmissao}
                onChange={(e) => handleInputChange("dataAdmissao", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="DD/MM/AAAA"
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

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Editar Funcionário */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Funcionário"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Função *</label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => handleInputChange("tipo", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Mecanico">Mecânico</option>
                <option value="Recepcionista">Recepcionista</option>
                <option value="Gerente">Gerente</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Contratação *</label>
              <select
                required
                value={formData.tipoContratacao}
                onChange={(e) => handleInputChange("tipoContratacao", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor de Despesa (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valorDespesa}
                onChange={(e) => handleInputChange("valorDespesa", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de Admissão</label>
              <input
                type="text"
                value={formData.dataAdmissao}
                onChange={(e) => handleInputChange("dataAdmissao", e.target.value)}
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
                  value={formData.endereco.cep}
                  onChange={(e) => handleEnderecoChange("cep", e.target.value)}
                  onBlur={handleCepBlur}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logradouro</label>
                <input
                  type="text"
                  value={formData.endereco.logradouro}
                  onChange={(e) => handleEnderecoChange("logradouro", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Complemento</label>
                  <input
                    type="text"
                    value={formData.endereco.complemento}
                    onChange={(e) => handleEnderecoChange("complemento", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  />
                </div>
              </div>
            </div>
          </div>

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
