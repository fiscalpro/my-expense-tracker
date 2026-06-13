import { Origem } from "@/types/origem";

const API_BASE = "http://localhost:8080";

export const fetchOrigens = async (): Promise<Origem[]> => {
  const response = await fetch(`${API_BASE}/origem`);
  if (!response.ok) throw new Error("Erro ao carregar orígens");
  const data = await response.json();
  return data.content ?? data;
};
