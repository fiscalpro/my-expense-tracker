import type { RegraClassificacaoOrigem } from "@/types/regra";

const API_BASE = "http://localhost:8080";

export const fetchRegras = async (): Promise<RegraClassificacaoOrigem[]> => {
  const response = await fetch(`${API_BASE}/regras-classificacao-origem`);
  if (!response.ok) throw new Error("Erro ao carregar regras");
  return response.json();
};

export const createRegra = async (regra: { palavraChave: string; origemId: string }) => {
  const response = await fetch(`${API_BASE}/regras-classificacao-origem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regra),
  });

  if (!response.ok) throw new Error("Erro ao criar regra");
  return response.json();
};

export const deleteRegra = async (id: string) => {
  const response = await fetch(`${API_BASE}/regras-classificacao-origem/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Erro ao deletar regra");
  return;
};

export const treinarRegrasEmLote = async (mesReferencia: string) => {
  const response = await fetch(
    `${API_BASE}/regras-classificacao-origem/treinar-em-lote?mesReferencia=${encodeURIComponent(mesReferencia)}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) throw new Error("Erro ao treinar regras em lote");
  return response.json();
};

export const reclassificarDespesasAntigas = async (mesReferencia: string) => {
  const response = await fetch(
    `${API_BASE}/despesas/reclassificar-origem?mesReferencia=${encodeURIComponent(mesReferencia)}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) throw new Error("Erro ao reclassificar despesas antigas");
  return response.json();
};
