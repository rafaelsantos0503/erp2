"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Building2, CreditCard, TrendingUp, TrendingDown, Calendar, Repeat } from "lucide-react";
import type { ContaBancaria, ContaPagar, ContaReceber, TipoRecorrencia } from "./types";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { financeiroService, type ContaBancariaAPI, type ContaPagarAPI, type ContaReceberAPI } from "@/lib/services/financeiro.service";

export default function FinanceiroPage() {
  const api = useApi();
  const { token } = useAuth();
  const empresaId = api.empresaId;
  
  const [activeTab, setActiveTab] = useState<"pagar" | "receber" | "bancarias">("pagar");
  const [carregando, setCarregando] = useState(true);

  // Função para formatar data (YYYY-MM-DD ou ISO -> DD/MM/YYYY)
  const formatarData = (data: string | undefined) => {
    if (!data) return "-";
    try {
      // Se for formato ISO completo (com timestamp), pega apenas a parte da data
      const dataLimpa = data.split("T")[0];
      // Separa por hífen (YYYY-MM-DD)
      const partes = dataLimpa.split("-");
      if (partes.length === 3) {
        const [ano, mes, dia] = partes;
        return `${dia}/${mes}/${ano}`;
      }
      // Se já estiver no formato DD/MM/YYYY, retorna como está
      if (data.includes("/")) {
        return data;
      }
      return data;
    } catch (error) {
      console.warn("Erro ao formatar data:", data, error);
      return data || "-";
    }
  };
  
  // Estados para Contas Bancárias
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [isContaBancariaModalOpen, setIsContaBancariaModalOpen] = useState(false);
  const [editingContaBancariaId, setEditingContaBancariaId] = useState<number | null>(null);
  const [contaBancariaFormData, setContaBancariaFormData] = useState({
    banco: "",
    agencia: "",
    conta: "",
    tipo: "CORRENTE" as ContaBancaria["tipo"],
    titular: "",
    tipoPessoa: "PJ" as "PF" | "PJ",
    cpf: "",
    cnpj: "",
    ativa: true,
  });

  // Funções de máscara
  const maskCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

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

  // Estados para Contas a Pagar
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [isContaPagarModalOpen, setIsContaPagarModalOpen] = useState(false);
  const [editingContaPagarId, setEditingContaPagarId] = useState<number | null>(null);
  const [contaPagarFormData, setContaPagarFormData] = useState({
    descricao: "",
    fornecedor: "",
    valor: "",
    dataVencimento: "",
    dataPagamento: "",
    pago: false,
    recorrencia: "NENHUMA" as TipoRecorrencia,
    contaBancariaId: "",
    observacoes: "",
  });

  // Estados para Contas a Receber
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [isContaReceberModalOpen, setIsContaReceberModalOpen] = useState(false);
  const [editingContaReceberId, setEditingContaReceberId] = useState<number | null>(null);
  const [contaReceberFormData, setContaReceberFormData] = useState({
    descricao: "",
    cliente: "",
    valor: "",
    dataVencimento: "",
    dataRecebimento: "",
    recebido: false,
    recorrencia: "NENHUMA" as TipoRecorrencia,
    contaBancariaId: "",
    observacoes: "",
  });

  // Paginação
  const [paginaAtualPagar, setPaginaAtualPagar] = useState(1);
  const [itensPorPaginaPagar, setItensPorPaginaPagar] = useState(10);
  const [paginaAtualReceber, setPaginaAtualReceber] = useState(1);
  const [itensPorPaginaReceber, setItensPorPaginaReceber] = useState(10);

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
        
        // Carregar contas bancárias
        const contasBancariasAPI = await financeiroService.contasBancarias.getAll(api);
        if (cancelado) return;
        setContasBancarias(contasBancariasAPI.map((c: ContaBancariaAPI): ContaBancaria => ({
          id: c.id,
          banco: c.banco,
          agencia: c.agencia,
          conta: c.conta,
          tipo: c.tipo,
          titular: c.titular,
          tipoPessoa: c.tipoPessoa,
          cpf: c.cpf,
          cnpj: c.cnpj,
          ativa: c.ativa,
        })));

        // Carregar contas a pagar
        const paginaPagar = await financeiroService.contasPagar.getAll(api, { page: 0, size: 1000 });
        if (cancelado) return;
        
        const contasPagarConvertidas = paginaPagar.content.map((c: ContaPagarAPI): ContaPagar => {
          // Normalizar datas - garantir que estejam no formato correto
          const dataVencimento = c.dataVencimento ? (c.dataVencimento.includes("T") ? c.dataVencimento.split("T")[0] : c.dataVencimento) : "";
          const dataPagamento = c.dataPagamento ? (c.dataPagamento.includes("T") ? c.dataPagamento.split("T")[0] : c.dataPagamento) : undefined;
          const dataCriacao = c.dataCriacao ? (c.dataCriacao.includes("T") ? c.dataCriacao.split("T")[0] : c.dataCriacao) : undefined;
          
          return {
            id: c.id,
            descricao: c.descricao,
            fornecedor: c.fornecedor,
            valor: c.valor,
            dataVencimento: dataVencimento,
            dataPagamento: dataPagamento,
            dataCriacao: dataCriacao,
            pago: c.pago,
            recorrencia: c.recorrencia,
            contaBancariaId: c.contaBancariaId,
            observacoes: c.observacoes,
          };
        });
        setContasPagar(contasPagarConvertidas);

        // Carregar contas a receber
        const paginaReceber = await financeiroService.contasReceber.getAll(api, { page: 0, size: 1000 });
        if (cancelado) return;
        
        const contasReceberConvertidas = paginaReceber.content.map((c: ContaReceberAPI): ContaReceber => {
          // Normalizar datas - garantir que estejam no formato correto
          const dataVencimento = c.dataVencimento ? (c.dataVencimento.includes("T") ? c.dataVencimento.split("T")[0] : c.dataVencimento) : "";
          const dataRecebimento = c.dataRecebimento ? (c.dataRecebimento.includes("T") ? c.dataRecebimento.split("T")[0] : c.dataRecebimento) : undefined;
          const dataCriacao = c.dataCriacao ? (c.dataCriacao.includes("T") ? c.dataCriacao.split("T")[0] : c.dataCriacao) : undefined;
          
          return {
            id: c.id,
            descricao: c.descricao,
            cliente: c.cliente,
            valor: c.valor,
            dataVencimento: dataVencimento,
            dataRecebimento: dataRecebimento,
            dataCriacao: dataCriacao,
            recebido: c.recebido,
            recorrencia: c.recorrencia,
            contaBancariaId: c.contaBancariaId,
            observacoes: c.observacoes,
            ordemServicoId: c.ordemServicoId,
          };
        });
        setContasReceber(contasReceberConvertidas);
      } catch (error) {
        if (cancelado) return;
        console.error("Erro ao carregar dados financeiros:", error);
        setContasBancarias([]);
        setContasPagar([]);
        setContasReceber([]);
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

  // Funções para Contas Bancárias
  const handleContaBancariaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataAPI = {
        banco: contaBancariaFormData.banco,
        agencia: contaBancariaFormData.agencia,
        conta: contaBancariaFormData.conta,
        tipo: contaBancariaFormData.tipo,
        titular: contaBancariaFormData.titular,
        tipoPessoa: contaBancariaFormData.tipoPessoa,
        cpf: contaBancariaFormData.tipoPessoa === "PF" ? (contaBancariaFormData.cpf || undefined) : undefined,
        cnpj: contaBancariaFormData.tipoPessoa === "PJ" ? (contaBancariaFormData.cnpj || undefined) : undefined,
        ativa: contaBancariaFormData.ativa,
      };

      if (editingContaBancariaId) {
        // Atualizar
        const contaAtualizada = await financeiroService.contasBancarias.update(api, editingContaBancariaId, dataAPI);
        setContasBancarias(contasBancarias.map(c => c.id === editingContaBancariaId ? {
          id: contaAtualizada.id,
          banco: contaAtualizada.banco,
          agencia: contaAtualizada.agencia,
          conta: contaAtualizada.conta,
          tipo: contaAtualizada.tipo,
          titular: contaAtualizada.titular,
          tipoPessoa: contaAtualizada.tipoPessoa,
          cpf: contaAtualizada.cpf,
          cnpj: contaAtualizada.cnpj,
          ativa: contaAtualizada.ativa,
        } : c));
      } else {
        // Criar
        const contaNova = await financeiroService.contasBancarias.create(api, dataAPI);
        setContasBancarias([...contasBancarias, {
          id: contaNova.id,
          banco: contaNova.banco,
          agencia: contaNova.agencia,
          conta: contaNova.conta,
          tipo: contaNova.tipo,
          titular: contaNova.titular,
          tipoPessoa: contaNova.tipoPessoa,
          cpf: contaNova.cpf,
          cnpj: contaNova.cnpj,
          ativa: contaNova.ativa,
        }]);
      }

      setIsContaBancariaModalOpen(false);
      setEditingContaBancariaId(null);
      setContaBancariaFormData({
        banco: "",
        agencia: "",
        conta: "",
        tipo: "CORRENTE",
        titular: "",
        tipoPessoa: "PJ",
        cpf: "",
        cnpj: "",
        ativa: true,
      });
    } catch (error) {
      console.error("Erro ao salvar conta bancária:", error);
      alert("Erro ao salvar conta bancária. Tente novamente.");
    }
  };

  const handleEditContaBancaria = (conta: ContaBancaria) => {
    setEditingContaBancariaId(conta.id);
    setContaBancariaFormData({
      banco: conta.banco,
      agencia: conta.agencia,
      conta: conta.conta,
      tipo: conta.tipo,
      titular: conta.titular,
      tipoPessoa: conta.tipoPessoa,
      cpf: conta.cpf || "",
      cnpj: conta.cnpj || "",
      ativa: conta.ativa,
    });
    setIsContaBancariaModalOpen(true);
  };

  const handleDeleteContaBancaria = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta conta bancária?")) {
      try {
        await financeiroService.contasBancarias.delete(api, id);
        setContasBancarias(contasBancarias.filter(c => c.id !== id));
      } catch (error) {
        console.error("Erro ao excluir conta bancária:", error);
        alert("Erro ao excluir conta bancária. Tente novamente.");
      }
    }
  };

  // Funções para Contas a Pagar
  const handleContaPagarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataAPI = {
        descricao: contaPagarFormData.descricao,
        fornecedor: contaPagarFormData.fornecedor,
        valor: parseFloat(contaPagarFormData.valor),
        dataVencimento: contaPagarFormData.dataVencimento,
        dataPagamento: contaPagarFormData.dataPagamento || undefined,
        pago: contaPagarFormData.pago,
        recorrencia: contaPagarFormData.recorrencia,
        contaBancariaId: contaPagarFormData.contaBancariaId ? parseInt(contaPagarFormData.contaBancariaId) : undefined,
        observacoes: contaPagarFormData.observacoes || undefined,
      };

      if (editingContaPagarId) {
        // Atualizar
        const contaAtualizada = await financeiroService.contasPagar.update(api, editingContaPagarId, dataAPI);
        const dataCriacaoNormalizada = contaAtualizada.dataCriacao ? (contaAtualizada.dataCriacao.includes("T") ? contaAtualizada.dataCriacao.split("T")[0] : contaAtualizada.dataCriacao) : undefined;
        setContasPagar(contasPagar.map(c => c.id === editingContaPagarId ? {
          id: contaAtualizada.id,
          descricao: contaAtualizada.descricao,
          fornecedor: contaAtualizada.fornecedor,
          valor: contaAtualizada.valor,
          dataVencimento: contaAtualizada.dataVencimento,
          dataPagamento: contaAtualizada.dataPagamento,
          dataCriacao: dataCriacaoNormalizada,
          pago: contaAtualizada.pago,
          recorrencia: contaAtualizada.recorrencia,
          contaBancariaId: contaAtualizada.contaBancariaId,
          observacoes: contaAtualizada.observacoes,
        } : c));
      } else {
        // Criar
        const contaNova = await financeiroService.contasPagar.create(api, dataAPI);
        const dataCriacaoNormalizada = contaNova.dataCriacao ? (contaNova.dataCriacao.includes("T") ? contaNova.dataCriacao.split("T")[0] : contaNova.dataCriacao) : undefined;
        setContasPagar([...contasPagar, {
          id: contaNova.id,
          descricao: contaNova.descricao,
          fornecedor: contaNova.fornecedor,
          valor: contaNova.valor,
          dataVencimento: contaNova.dataVencimento,
          dataPagamento: contaNova.dataPagamento,
          dataCriacao: dataCriacaoNormalizada,
          pago: contaNova.pago,
          recorrencia: contaNova.recorrencia,
          contaBancariaId: contaNova.contaBancariaId,
          observacoes: contaNova.observacoes,
        }]);
        
        // Se tiver recorrência, criar próximas ocorrências (backend deve lidar com isso)
        if (contaNova.recorrencia !== "NENHUMA") {
          gerarRecorrenciaPagar(contaNova as ContaPagar);
        }
      }

      setIsContaPagarModalOpen(false);
      setEditingContaPagarId(null);
      resetContaPagarForm();
    } catch (error) {
      console.error("Erro ao salvar conta a pagar:", error);
      alert("Erro ao salvar conta a pagar. Tente novamente.");
    }
  };

  const gerarRecorrenciaPagar = (conta: ContaPagar) => {
    // Implementação de recorrência será feita via job/cron no backend
    // Por enquanto, apenas salvamos a informação de recorrência
  };

  const resetContaPagarForm = () => {
    setContaPagarFormData({
      descricao: "",
      fornecedor: "",
      valor: "",
      dataVencimento: "",
      dataPagamento: "",
      pago: false,
      recorrencia: "NENHUMA",
      contaBancariaId: "",
      observacoes: "",
    });
  };

  const handleEditContaPagar = (conta: ContaPagar) => {
    setEditingContaPagarId(conta.id);
    setContaPagarFormData({
      descricao: conta.descricao,
      fornecedor: conta.fornecedor,
      valor: conta.valor.toString(),
      dataVencimento: conta.dataVencimento,
      dataPagamento: conta.dataPagamento || "",
      pago: conta.pago,
      recorrencia: conta.recorrencia,
      contaBancariaId: conta.contaBancariaId?.toString() || "",
      observacoes: conta.observacoes || "",
    });
    setIsContaPagarModalOpen(true);
  };

  const handleDeleteContaPagar = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta conta a pagar?")) {
      try {
        await financeiroService.contasPagar.delete(api, id);
        setContasPagar(contasPagar.filter(c => c.id !== id));
      } catch (error) {
        console.error("Erro ao excluir conta a pagar:", error);
        alert("Erro ao excluir conta a pagar. Tente novamente.");
      }
    }
  };

  const togglePago = async (id: number) => {
    const conta = contasPagar.find(c => c.id === id);
    if (!conta) return;

    try {
      const dataAtualizada = {
        pago: !conta.pago,
        dataPagamento: !conta.pago ? new Date().toISOString().split('T')[0] : undefined,
      };
      const contaAtualizada = await financeiroService.contasPagar.update(api, id, dataAtualizada);
      setContasPagar(contasPagar.map(c => c.id === id ? {
        ...c,
        pago: contaAtualizada.pago,
        dataPagamento: contaAtualizada.dataPagamento,
      } : c));
    } catch (error) {
      console.error("Erro ao atualizar status da conta:", error);
      alert("Erro ao atualizar status da conta. Tente novamente.");
    }
  };

  // Funções para Contas a Receber
  const handleContaReceberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataAPI = {
        descricao: contaReceberFormData.descricao,
        cliente: contaReceberFormData.cliente,
        valor: parseFloat(contaReceberFormData.valor),
        dataVencimento: contaReceberFormData.dataVencimento,
        dataRecebimento: contaReceberFormData.dataRecebimento || undefined,
        recebido: contaReceberFormData.recebido,
        recorrencia: contaReceberFormData.recorrencia,
        contaBancariaId: contaReceberFormData.contaBancariaId ? parseInt(contaReceberFormData.contaBancariaId) : undefined,
        observacoes: contaReceberFormData.observacoes || undefined,
      };

      if (editingContaReceberId) {
        // Atualizar
        const contaAtualizada = await financeiroService.contasReceber.update(api, editingContaReceberId, dataAPI);
        const dataCriacaoNormalizada = contaAtualizada.dataCriacao ? (contaAtualizada.dataCriacao.includes("T") ? contaAtualizada.dataCriacao.split("T")[0] : contaAtualizada.dataCriacao) : undefined;
        setContasReceber(contasReceber.map(c => c.id === editingContaReceberId ? {
          id: contaAtualizada.id,
          descricao: contaAtualizada.descricao,
          cliente: contaAtualizada.cliente,
          valor: contaAtualizada.valor,
          dataVencimento: contaAtualizada.dataVencimento,
          dataRecebimento: contaAtualizada.dataRecebimento,
          dataCriacao: dataCriacaoNormalizada,
          recebido: contaAtualizada.recebido,
          recorrencia: contaAtualizada.recorrencia,
          contaBancariaId: contaAtualizada.contaBancariaId,
          observacoes: contaAtualizada.observacoes,
          ordemServicoId: contaAtualizada.ordemServicoId,
        } : c));
      } else {
        // Criar
        const contaNova = await financeiroService.contasReceber.create(api, dataAPI);
        const dataCriacaoNormalizada = contaNova.dataCriacao ? (contaNova.dataCriacao.includes("T") ? contaNova.dataCriacao.split("T")[0] : contaNova.dataCriacao) : undefined;
        setContasReceber([...contasReceber, {
          id: contaNova.id,
          descricao: contaNova.descricao,
          cliente: contaNova.cliente,
          valor: contaNova.valor,
          dataVencimento: contaNova.dataVencimento,
          dataRecebimento: contaNova.dataRecebimento,
          dataCriacao: dataCriacaoNormalizada,
          recebido: contaNova.recebido,
          recorrencia: contaNova.recorrencia,
          contaBancariaId: contaNova.contaBancariaId,
          observacoes: contaNova.observacoes,
          ordemServicoId: contaNova.ordemServicoId,
        }]);
        
        // Se tiver recorrência, criar próximas ocorrências (backend deve lidar com isso)
        if (contaNova.recorrencia !== "NENHUMA") {
          gerarRecorrenciaReceber(contaNova as ContaReceber);
        }
      }

      setIsContaReceberModalOpen(false);
      setEditingContaReceberId(null);
      resetContaReceberForm();
    } catch (error) {
      console.error("Erro ao salvar conta a receber:", error);
      alert("Erro ao salvar conta a receber. Tente novamente.");
    }
  };

  const gerarRecorrenciaReceber = (conta: ContaReceber) => {
    // Implementação de recorrência será feita via job/cron no backend
    // Por enquanto, apenas salvamos a informação de recorrência
  };

  const resetContaReceberForm = () => {
    setContaReceberFormData({
      descricao: "",
      cliente: "",
      valor: "",
      dataVencimento: "",
      dataRecebimento: "",
      recebido: false,
      recorrencia: "NENHUMA",
      contaBancariaId: "",
      observacoes: "",
    });
  };

  const handleEditContaReceber = (conta: ContaReceber) => {
    setEditingContaReceberId(conta.id);
    setContaReceberFormData({
      descricao: conta.descricao,
      cliente: conta.cliente,
      valor: conta.valor.toString(),
      dataVencimento: conta.dataVencimento,
      dataRecebimento: conta.dataRecebimento || "",
      recebido: conta.recebido,
      recorrencia: conta.recorrencia,
      contaBancariaId: conta.contaBancariaId?.toString() || "",
      observacoes: conta.observacoes || "",
    });
    setIsContaReceberModalOpen(true);
  };

  const handleDeleteContaReceber = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta conta a receber?")) {
      try {
        await financeiroService.contasReceber.delete(api, id);
        setContasReceber(contasReceber.filter(c => c.id !== id));
      } catch (error) {
        console.error("Erro ao excluir conta a receber:", error);
        alert("Erro ao excluir conta a receber. Tente novamente.");
      }
    }
  };

  const toggleRecebido = async (id: number) => {
    const conta = contasReceber.find(c => c.id === id);
    if (!conta) return;

    try {
      const dataAtualizada = {
        recebido: !conta.recebido,
        dataRecebimento: !conta.recebido ? new Date().toISOString().split('T')[0] : undefined,
      };
      const contaAtualizada = await financeiroService.contasReceber.update(api, id, dataAtualizada);
      setContasReceber(contasReceber.map(c => c.id === id ? {
        ...c,
        recebido: contaAtualizada.recebido,
        dataRecebimento: contaAtualizada.dataRecebimento,
      } : c));
    } catch (error) {
      console.error("Erro ao atualizar status da conta:", error);
      alert("Erro ao atualizar status da conta. Tente novamente.");
    }
  };

  // Paginação Contas a Pagar
  const totalPaginasPagar = Math.ceil(contasPagar.length / itensPorPaginaPagar) || 1;
  const indiceInicioPagar = (paginaAtualPagar - 1) * itensPorPaginaPagar;
  const indiceFimPagar = indiceInicioPagar + itensPorPaginaPagar;
  const contasPagarPaginaAtual = contasPagar.slice(indiceInicioPagar, indiceFimPagar);

  useEffect(() => {
    if (paginaAtualPagar > totalPaginasPagar && totalPaginasPagar > 0) {
      setPaginaAtualPagar(totalPaginasPagar);
    }
  }, [totalPaginasPagar, paginaAtualPagar]);

  // Paginação Contas a Receber
  const totalPaginasReceber = Math.ceil(contasReceber.length / itensPorPaginaReceber) || 1;
  const indiceInicioReceber = (paginaAtualReceber - 1) * itensPorPaginaReceber;
  const indiceFimReceber = indiceInicioReceber + itensPorPaginaReceber;
  const contasReceberPaginaAtual = contasReceber.slice(indiceInicioReceber, indiceFimReceber);

  useEffect(() => {
    if (paginaAtualReceber > totalPaginasReceber && totalPaginasReceber > 0) {
      setPaginaAtualReceber(totalPaginasReceber);
    }
  }, [totalPaginasReceber, paginaAtualReceber]);

  // Cálculos
  const totalPagar = contasPagar.reduce((sum, c) => sum + c.valor, 0);
  const totalPago = contasPagar.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);
  const totalAPagar = totalPagar - totalPago;
  const totalReceber = contasReceber.reduce((sum, c) => sum + c.valor, 0);
  const totalRecebido = contasReceber.filter(c => c.recebido).reduce((sum, c) => sum + c.valor, 0);
  const totalAReceber = totalReceber - totalRecebido;

  if (carregando) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Gestão de contas a pagar e receber</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total a Pagar</p>
                <p className="text-2xl font-bold text-red-600">{totalAPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total a Receber</p>
                <p className="text-2xl font-bold text-green-600">{totalAReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Já Pago</p>
                <p className="text-2xl font-bold">{totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Já Recebido</p>
                <p className="text-2xl font-bold">{totalRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("pagar")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "pagar"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Contas a Pagar
        </button>
        <button
          onClick={() => setActiveTab("receber")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "receber"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Contas a Receber
        </button>
        <button
          onClick={() => setActiveTab("bancarias")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "bancarias"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Contas Bancárias
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === "pagar" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas a Pagar</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Itens por página:</label>
                <select
                  value={itensPorPaginaPagar}
                  onChange={(e) => {
                    setItensPorPaginaPagar(Number(e.target.value));
                    setPaginaAtualPagar(1);
                  }}
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <Button onClick={() => {
                  resetContaPagarForm();
                  setIsContaPagarModalOpen(true);
                }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Conta
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contasPagarPaginaAtual.length > 0 ? (
                contasPagarPaginaAtual.map((conta) => {
                  const contaBancaria = conta.contaBancariaId 
                    ? contasBancarias.find(c => c.id === conta.contaBancariaId)
                    : null;
                  return (
                    <div
                      key={conta.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        conta.pago 
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" 
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-lg">{conta.descricao}</p>
                            {conta.recorrencia !== "NENHUMA" && (
                              <Badge variant="info" className="flex items-center gap-1">
                                <Repeat className="h-3 w-3" />
                                {conta.recorrencia}
                              </Badge>
                            )}
                            <Badge variant={conta.pago ? "success" : "destructive"}>
                              {conta.pago ? "Pago" : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Fornecedor: {conta.fornecedor}</p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span><strong className="text-foreground">Valor:</strong> {conta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                            <span><strong className="text-foreground">Vencimento:</strong> {formatarData(conta.dataVencimento)}</span>
                            {conta.pago && conta.dataPagamento && (
                              <span><strong className="text-foreground">Pagamento:</strong> {formatarData(conta.dataPagamento)}</span>
                            )}
                            {conta.dataCriacao && (
                              <span><strong className="text-foreground">Criação:</strong> {formatarData(conta.dataCriacao)}</span>
                            )}
                            {contaBancaria && (
                              <span><strong className="text-foreground">Conta:</strong> {contaBancaria.banco} - {contaBancaria.agencia}</span>
                            )}
                          </div>
                          {conta.observacoes && (
                            <p className="text-xs text-muted-foreground mt-1">{conta.observacoes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContaPagar(conta)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContaPagar(conta.id)}
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
                  <p className="text-muted-foreground">Nenhuma conta a pagar cadastrada</p>
                </div>
              )}
            </div>

            {/* Paginação */}
            {contasPagar.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {indiceInicioPagar + 1} até {Math.min(indiceFimPagar, contasPagar.length)} de {contasPagar.length} contas
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtualPagar(prev => Math.max(1, prev - 1))}
                    disabled={paginaAtualPagar === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPaginasPagar }, (_, i) => i + 1).map((pagina) => {
                      if (
                        pagina === 1 ||
                        pagina === totalPaginasPagar ||
                        (pagina >= paginaAtualPagar - 1 && pagina <= paginaAtualPagar + 1)
                      ) {
                        return (
                          <Button
                            key={pagina}
                            variant={pagina === paginaAtualPagar ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPaginaAtualPagar(pagina)}
                            className="min-w-[2.5rem]"
                          >
                            {pagina}
                          </Button>
                        );
                      } else if (pagina === paginaAtualPagar - 2 || pagina === paginaAtualPagar + 2) {
                        return <span key={pagina} className="px-2 text-muted-foreground">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtualPagar(prev => Math.min(totalPaginasPagar, prev + 1))}
                    disabled={paginaAtualPagar === totalPaginasPagar}
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
      )}

      {activeTab === "receber" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas a Receber</CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Itens por página:</label>
                <select
                  value={itensPorPaginaReceber}
                  onChange={(e) => {
                    setItensPorPaginaReceber(Number(e.target.value));
                    setPaginaAtualReceber(1);
                  }}
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <Button onClick={() => {
                  resetContaReceberForm();
                  setIsContaReceberModalOpen(true);
                }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Conta
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contasReceberPaginaAtual.length > 0 ? (
                contasReceberPaginaAtual.map((conta) => {
                  const contaBancaria = conta.contaBancariaId 
                    ? contasBancarias.find(c => c.id === conta.contaBancariaId)
                    : null;
                  return (
                    <div
                      key={conta.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        conta.recebido 
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" 
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-lg">{conta.descricao}</p>
                            {conta.ordemServicoId && (
                              <Badge variant="purple">
                                OS-{String(conta.ordemServicoId).padStart(3, '0')}
                              </Badge>
                            )}
                            {conta.recorrencia !== "NENHUMA" && (
                              <Badge variant="info" className="flex items-center gap-1">
                                <Repeat className="h-3 w-3" />
                                {conta.recorrencia}
                              </Badge>
                            )}
                            <Badge variant={conta.recebido ? "success" : "warning"}>
                              {conta.recebido ? "Recebido" : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Cliente: {conta.cliente}</p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span><strong className="text-foreground">Valor:</strong> {conta.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                            <span><strong className="text-foreground">Vencimento:</strong> {formatarData(conta.dataVencimento)}</span>
                            {conta.recebido && conta.dataRecebimento && (
                              <span><strong className="text-foreground">Recebimento:</strong> {formatarData(conta.dataRecebimento)}</span>
                            )}
                            {conta.dataCriacao && (
                              <span><strong className="text-foreground">Criação:</strong> {formatarData(conta.dataCriacao)}</span>
                            )}
                            {contaBancaria && (
                              <span><strong className="text-foreground">Conta:</strong> {contaBancaria.banco} - {contaBancaria.agencia}</span>
                            )}
                          </div>
                          {conta.observacoes && (
                            <p className="text-xs text-muted-foreground mt-1">{conta.observacoes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContaReceber(conta)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContaReceber(conta.id)}
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
                  <p className="text-muted-foreground">Nenhuma conta a receber cadastrada</p>
                </div>
              )}
            </div>

            {/* Paginação */}
            {contasReceber.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {indiceInicioReceber + 1} até {Math.min(indiceFimReceber, contasReceber.length)} de {contasReceber.length} contas
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtualReceber(prev => Math.max(1, prev - 1))}
                    disabled={paginaAtualReceber === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPaginasReceber }, (_, i) => i + 1).map((pagina) => {
                      if (
                        pagina === 1 ||
                        pagina === totalPaginasReceber ||
                        (pagina >= paginaAtualReceber - 1 && pagina <= paginaAtualReceber + 1)
                      ) {
                        return (
                          <Button
                            key={pagina}
                            variant={pagina === paginaAtualReceber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPaginaAtualReceber(pagina)}
                            className="min-w-[2.5rem]"
                          >
                            {pagina}
                          </Button>
                        );
                      } else if (pagina === paginaAtualReceber - 2 || pagina === paginaAtualReceber + 2) {
                        return <span key={pagina} className="px-2 text-muted-foreground">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtualReceber(prev => Math.min(totalPaginasReceber, prev + 1))}
                    disabled={paginaAtualReceber === totalPaginasReceber}
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
      )}

      {activeTab === "bancarias" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas Bancárias</CardTitle>
              <Button onClick={() => {
                setEditingContaBancariaId(null);
                setContaBancariaFormData({
                  banco: "",
                  agencia: "",
                  conta: "",
                  tipo: "CORRENTE",
                  titular: "",
                  tipoPessoa: "PJ",
                  cpf: "",
                  cnpj: "",
                  ativa: true,
                });
                setIsContaBancariaModalOpen(true);
              }} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Conta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contasBancarias.length > 0 ? (
                contasBancarias.map((conta) => (
                  <div
                    key={conta.id}
                    className="rounded-lg border border-border bg-background p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-lg">{conta.banco}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            conta.ativa 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                          }`}>
                            {conta.ativa ? "Ativa" : "Inativa"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-secondary">
                            {conta.tipo}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Agência: {conta.agencia} | Conta: {conta.conta}</p>
                        <p className="text-sm text-muted-foreground">Titular: {conta.titular}</p>
                        {conta.tipoPessoa === "PF" && conta.cpf && (
                          <p className="text-xs text-muted-foreground">CPF: {conta.cpf}</p>
                        )}
                        {conta.tipoPessoa === "PJ" && conta.cnpj && (
                          <p className="text-xs text-muted-foreground">CNPJ: {conta.cnpj}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditContaBancaria(conta)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContaBancaria(conta.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma conta bancária cadastrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Conta Bancária */}
      <Modal
        isOpen={isContaBancariaModalOpen}
        onClose={() => {
          setIsContaBancariaModalOpen(false);
          setEditingContaBancariaId(null);
        }}
        title={editingContaBancariaId ? "Editar Conta Bancária" : "Nova Conta Bancária"}
      >
        <form onSubmit={handleContaBancariaSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Banco *</label>
            <input
              type="text"
              required
              value={contaBancariaFormData.banco}
              onChange={(e) => setContaBancariaFormData({ ...contaBancariaFormData, banco: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Banco do Brasil"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agência *</label>
              <input
                type="text"
                required
                value={contaBancariaFormData.agencia}
                onChange={(e) => setContaBancariaFormData({ ...contaBancariaFormData, agencia: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="1234-5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Conta *</label>
              <input
                type="text"
                required
                value={contaBancariaFormData.conta}
                onChange={(e) => setContaBancariaFormData({ ...contaBancariaFormData, conta: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="12345-6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select
              required
              value={contaBancariaFormData.tipo}
              onChange={(e) => setContaBancariaFormData({ ...contaBancariaFormData, tipo: e.target.value as ContaBancaria["tipo"] })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="CORRENTE">Conta Corrente</option>
              <option value="POUPANCA">Poupança</option>
              <option value="SALARIO">Salário</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Titular *</label>
            <input
              type="text"
              required
              value={contaBancariaFormData.titular}
              onChange={(e) => setContaBancariaFormData({ ...contaBancariaFormData, titular: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Nome do titular"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Pessoa *</label>
            <select
              required
              value={contaBancariaFormData.tipoPessoa}
              onChange={(e) => {
                const novoTipo = e.target.value as "PF" | "PJ";
                setContaBancariaFormData({ 
                  ...contaBancariaFormData, 
                  tipoPessoa: novoTipo,
                  cpf: novoTipo === "PF" ? contaBancariaFormData.cpf : "",
                  cnpj: novoTipo === "PJ" ? contaBancariaFormData.cnpj : "",
                });
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="PF">Pessoa Física (PF)</option>
              <option value="PJ">Pessoa Jurídica (PJ)</option>
            </select>
          </div>

          {contaBancariaFormData.tipoPessoa === "PF" && (
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input
                type="text"
                value={contaBancariaFormData.cpf}
                onChange={(e) => {
                  const maskedValue = maskCPF(e.target.value);
                  setContaBancariaFormData({ ...contaBancariaFormData, cpf: maskedValue });
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          )}

          {contaBancariaFormData.tipoPessoa === "PJ" && (
            <div>
              <label className="block text-sm font-medium mb-1">CNPJ</label>
              <input
                type="text"
                value={contaBancariaFormData.cnpj}
                onChange={(e) => {
                  const maskedValue = maskCNPJ(e.target.value);
                  setContaBancariaFormData({ ...contaBancariaFormData, cnpj: maskedValue });
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativa"
              checked={contaBancariaFormData.ativa}
              onChange={(e) => setContaBancariaFormData({ ...contaBancariaFormData, ativa: e.target.checked })}
              className="rounded border-input"
            />
            <label htmlFor="ativa" className="text-sm font-medium">
              Conta Ativa
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsContaBancariaModalOpen(false);
                setEditingContaBancariaId(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingContaBancariaId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Conta a Pagar */}
      <Modal
        isOpen={isContaPagarModalOpen}
        onClose={() => {
          setIsContaPagarModalOpen(false);
          setEditingContaPagarId(null);
          resetContaPagarForm();
        }}
        title={editingContaPagarId ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
      >
        <form onSubmit={handleContaPagarSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <input
              type="text"
              required
              value={contaPagarFormData.descricao}
              onChange={(e) => setContaPagarFormData({ ...contaPagarFormData, descricao: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Conta de Luz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fornecedor *</label>
            <input
              type="text"
              required
              value={contaPagarFormData.fornecedor}
              onChange={(e) => setContaPagarFormData({ ...contaPagarFormData, fornecedor: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Nome do fornecedor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={contaPagarFormData.valor}
                onChange={(e) => setContaPagarFormData({ ...contaPagarFormData, valor: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data de Vencimento *</label>
              <input
                type="date"
                required
                value={contaPagarFormData.dataVencimento}
                onChange={(e) => setContaPagarFormData({ ...contaPagarFormData, dataVencimento: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recorrência</label>
            <select
              value={contaPagarFormData.recorrencia}
              onChange={(e) => setContaPagarFormData({ ...contaPagarFormData, recorrencia: e.target.value as TipoRecorrencia })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="NENHUMA">Nenhuma</option>
              <option value="MENSAL">Mensal</option>
              <option value="TRIMESTRAL">Trimestral</option>
              <option value="SEMESTRAL">Semestral</option>
              <option value="ANUAL">Anual</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Selecione a recorrência para gerar automaticamente novas contas no período escolhido
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Conta Bancária</label>
            <select
              value={contaPagarFormData.contaBancariaId}
              onChange={(e) => setContaPagarFormData({ ...contaPagarFormData, contaBancariaId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione uma conta bancária</option>
              {contasBancarias.filter(c => c.ativa).map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.banco} - {conta.agencia} - {conta.conta}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={contaPagarFormData.observacoes}
              onChange={(e) => setContaPagarFormData({ ...contaPagarFormData, observacoes: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Observações adicionais"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pago"
              checked={contaPagarFormData.pago}
              onChange={(e) => {
                setContaPagarFormData({ 
                  ...contaPagarFormData, 
                  pago: e.target.checked,
                  dataPagamento: e.target.checked ? new Date().toISOString().split('T')[0] : ""
                });
              }}
              className="rounded border-input"
            />
            <label htmlFor="pago" className="text-sm font-medium">
              Conta já foi paga
            </label>
          </div>

          {contaPagarFormData.pago && (
            <div>
              <label className="block text-sm font-medium mb-1">Data de Pagamento</label>
              <input
                type="date"
                value={contaPagarFormData.dataPagamento}
                onChange={(e) => setContaPagarFormData({ ...contaPagarFormData, dataPagamento: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsContaPagarModalOpen(false);
                setEditingContaPagarId(null);
                resetContaPagarForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingContaPagarId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Conta a Receber */}
      <Modal
        isOpen={isContaReceberModalOpen}
        onClose={() => {
          setIsContaReceberModalOpen(false);
          setEditingContaReceberId(null);
          resetContaReceberForm();
        }}
        title={editingContaReceberId ? "Editar Conta a Receber" : "Nova Conta a Receber"}
      >
        <form onSubmit={handleContaReceberSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <input
              type="text"
              required
              value={contaReceberFormData.descricao}
              onChange={(e) => setContaReceberFormData({ ...contaReceberFormData, descricao: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ex: Prestação de Serviços"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cliente *</label>
            <input
              type="text"
              required
              value={contaReceberFormData.cliente}
              onChange={(e) => setContaReceberFormData({ ...contaReceberFormData, cliente: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Nome do cliente"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={contaReceberFormData.valor}
                onChange={(e) => setContaReceberFormData({ ...contaReceberFormData, valor: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data de Vencimento *</label>
              <input
                type="date"
                required
                value={contaReceberFormData.dataVencimento}
                onChange={(e) => setContaReceberFormData({ ...contaReceberFormData, dataVencimento: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recorrência</label>
            <select
              value={contaReceberFormData.recorrencia}
              onChange={(e) => setContaReceberFormData({ ...contaReceberFormData, recorrencia: e.target.value as TipoRecorrencia })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="NENHUMA">Nenhuma</option>
              <option value="MENSAL">Mensal</option>
              <option value="TRIMESTRAL">Trimestral</option>
              <option value="SEMESTRAL">Semestral</option>
              <option value="ANUAL">Anual</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Selecione a recorrência para gerar automaticamente novas contas no período escolhido
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Conta Bancária</label>
            <select
              value={contaReceberFormData.contaBancariaId}
              onChange={(e) => setContaReceberFormData({ ...contaReceberFormData, contaBancariaId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione uma conta bancária</option>
              {contasBancarias.filter(c => c.ativa).map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.banco} - {conta.agencia} - {conta.conta}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              value={contaReceberFormData.observacoes}
              onChange={(e) => setContaReceberFormData({ ...contaReceberFormData, observacoes: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Observações adicionais"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recebido"
              checked={contaReceberFormData.recebido}
              onChange={(e) => {
                setContaReceberFormData({ 
                  ...contaReceberFormData, 
                  recebido: e.target.checked,
                  dataRecebimento: e.target.checked ? new Date().toISOString().split('T')[0] : ""
                });
              }}
              className="rounded border-input"
            />
            <label htmlFor="recebido" className="text-sm font-medium">
              Conta já foi recebida
            </label>
          </div>

          {contaReceberFormData.recebido && (
            <div>
              <label className="block text-sm font-medium mb-1">Data de Recebimento</label>
              <input
                type="date"
                value={contaReceberFormData.dataRecebimento}
                onChange={(e) => setContaReceberFormData({ ...contaReceberFormData, dataRecebimento: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsContaReceberModalOpen(false);
                setEditingContaReceberId(null);
                resetContaReceberForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingContaReceberId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

