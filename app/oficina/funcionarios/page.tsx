"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Users, Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Funcionario, Endereco } from "../types";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { funcionarioService, type FuncionarioAPI } from "@/lib/services/funcionario.service";

export default function FuncionariosPage() {
  const api = useApi();
  const { token } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  // Ref para garantir que os dados sejam carregados apenas uma vez
  const dadosCarregados = useRef(false);
  
  // Carregar funcionários do backend quando a rota for acessada
  useEffect(() => {
    // Evita carregar duas vezes (mesmo em modo desenvolvimento do React)
    if (dadosCarregados.current) return;
    if (!api.empresaId || !token) return;
    
    let cancelado = false;
    dadosCarregados.current = true;
    
    async function carregarFuncionarios() {
      if (!api.empresaId || !token) return;
      
      try {
        const pagina = await funcionarioService.getAll(api, { page: 0, size: 1000 });
        if (cancelado) return;
        // Converte FuncionarioAPI para Funcionario
        const funcionariosConvertidos: Funcionario[] = pagina.content.map((f: FuncionarioAPI) => ({
          id: f.id,
          nome: f.nome,
          telefone: f.telefone,
          email: f.email,
          tipo: f.tipo as Funcionario["tipo"], // Cast necessário
          tipoContratacao: f.tipoContratacao,
          valorDespesa: f.valorDespesa,
          cpf: f.cpf,
          dataAdmissao: f.dataAdmissao,
          endereco: f.endereco,
        }));
        setFuncionarios(funcionariosConvertidos);
      } catch (error) {
        if (cancelado) return;
        console.error("Erro ao carregar funcionários:", error);
        setFuncionarios([]);
      }
    }
    
    carregarFuncionarios();
    
    return () => {
      cancelado = true;
      // Reset apenas se empresaId ou token mudarem
      if (!api.empresaId || !token) {
        dadosCarregados.current = false;
      }
    };
  }, [api.empresaId, token]); // api.empresaId é estável, mas podemos melhorar isso depois
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

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

  const mapEnderecoToApi = (
    endereco?: Endereco
  ): FuncionarioAPI["endereco"] | undefined => {
    if (!endereco) {
      return undefined;
    }

    return {
      cep: endereco.cep ?? "",
      logradouro: endereco.logradouro ?? "",
      numero: endereco.numero ?? "",
      complemento: endereco.complemento ?? "",
      bairro: endereco.bairro ?? "",
      cidade: endereco.cidade ?? "",
      estado: endereco.estado ?? "",
    };
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Salvar no backend
      const funcionarioSalvo = await funcionarioService.create(api, {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        tipo: formData.tipo,
        tipoContratacao: formData.tipoContratacao,
        valorDespesa: formData.valorDespesa ? parseFloat(formData.valorDespesa) : 0,
        cpf: formData.cpf,
        dataAdmissao: formData.dataAdmissao,
        endereco: mapEnderecoToApi(formData.endereco),
      });
      
      // Atualizar lista local
      setFuncionarios([...funcionarios, {
        id: funcionarioSalvo.id,
        nome: funcionarioSalvo.nome,
        telefone: funcionarioSalvo.telefone,
        email: funcionarioSalvo.email,
        tipo: funcionarioSalvo.tipo as Funcionario["tipo"],
        tipoContratacao: funcionarioSalvo.tipoContratacao,
        valorDespesa: funcionarioSalvo.valorDespesa,
        cpf: funcionarioSalvo.cpf,
        dataAdmissao: funcionarioSalvo.dataAdmissao,
        endereco: funcionarioSalvo.endereco,
      }]);
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao criar funcionário:", error);
      alert("Erro ao criar funcionário. Tente novamente.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      // Atualizar no backend
      const funcionarioAtualizadoAPI = await funcionarioService.update(api, editingId, {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        tipo: formData.tipo, // Backend espera string
        tipoContratacao: formData.tipoContratacao,
        valorDespesa: formData.valorDespesa ? parseFloat(formData.valorDespesa) : 0,
        cpf: formData.cpf,
        dataAdmissao: formData.dataAdmissao,
        endereco: mapEnderecoToApi(formData.endereco),
      });
      
      // Atualizar lista local
      setFuncionarios(funcionarios.map((f) => (f.id === editingId ? {
        id: funcionarioAtualizadoAPI.id,
        nome: funcionarioAtualizadoAPI.nome,
        telefone: funcionarioAtualizadoAPI.telefone,
        email: funcionarioAtualizadoAPI.email,
        tipo: funcionarioAtualizadoAPI.tipo as Funcionario["tipo"],
        tipoContratacao: funcionarioAtualizadoAPI.tipoContratacao,
        valorDespesa: funcionarioAtualizadoAPI.valorDespesa,
        cpf: funcionarioAtualizadoAPI.cpf,
        dataAdmissao: funcionarioAtualizadoAPI.dataAdmissao,
        endereco: funcionarioAtualizadoAPI.endereco,
      } : f)));
      
      setIsEditModalOpen(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      alert("Erro ao atualizar funcionário. Tente novamente.");
    }
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

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await funcionarioService.delete(api, id);
        setFuncionarios(funcionarios.filter((f) => f.id !== id));
      } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
        alert("Erro ao excluir funcionário. Tente novamente.");
      }
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

  // Calcular paginação
  const totalPaginas = Math.ceil(funcionarios.length / itensPorPagina) || 1;
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const funcionariosPaginaAtual = funcionarios.slice(indiceInicio, indiceFim);

  // Ajustar página atual se estiver fora do range válido
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Lista de Funcionários
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
                {funcionariosPaginaAtual.length > 0 ? (
                  funcionariosPaginaAtual.map((funcionario) => (
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
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(funcionario)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(funcionario.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Nenhum funcionário cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação */}
          {funcionarios.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {indiceInicio + 1} até {Math.min(indiceFim, funcionarios.length)} de {funcionarios.length} funcionários
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
