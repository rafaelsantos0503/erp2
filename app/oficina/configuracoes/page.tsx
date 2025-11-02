"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Settings, Plus } from "lucide-react";
import type { Marca, Modelo } from "./types";

export type { Marca, Modelo };

export default function ConfiguracoesPage() {
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);
  const [isModeloModalOpen, setIsModeloModalOpen] = useState(false);
  
  const [marcaFormData, setMarcaFormData] = useState({
    nome: "",
  });

  const [modeloFormData, setModeloFormData] = useState({
    marcaId: "",
    nome: "",
  });

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

  // Estados para dropdowns e pesquisa
  const [marcaSearchTerm, setMarcaSearchTerm] = useState("");
  const [modeloSearchTerm, setModeloSearchTerm] = useState("");
  const [selectedMarcaId, setSelectedMarcaId] = useState<number | null>(null);
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

  const handleMarcaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = marcas.length + 1;
    const novaMarca: Marca = {
      id: novoId,
      nome: marcaFormData.nome,
    };

    setMarcas([...marcas, novaMarca]);
    handleMarcaSelect(novaMarca); // Auto-select the new brand
    setIsMarcaModalOpen(false);
    setMarcaFormData({ nome: "" });
  };

  const handleModeloSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novoId = modelos.length + 1;
    const novoModelo: Modelo = {
      id: novoId,
      marcaId: parseInt(modeloFormData.marcaId),
      nome: modeloFormData.nome,
    };

    setModelos([...modelos, novoModelo]);
    handleModeloSelect(novoModelo); // Auto-select the new model
    setIsModeloModalOpen(false);
    setModeloFormData({ marcaId: "", nome: "" });
  };

  const handleMarcaSelect = (marca: Marca) => {
    setMarcaSearchTerm(marca.nome);
    setSelectedMarcaId(marca.id);
    setShowMarcaDropdown(false);
    setModeloSearchTerm(""); // Clear model search when brand changes
  };

  const handleModeloSelect = (modelo: Modelo) => {
    setModeloSearchTerm(modelo.nome);
    setShowModeloDropdown(false);
  };

  const handleOpenModeloModal = () => {
    if (!selectedMarcaId) {
      alert("Por favor, selecione uma marca primeiro.");
      return;
    }
    setModeloFormData({ marcaId: selectedMarcaId.toString(), nome: "" });
    setIsModeloModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Configurações da oficina</p>
      </div>

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
