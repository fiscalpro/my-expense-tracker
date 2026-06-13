export interface RegraClassificacaoOrigem {
  id: string;
  palavraChave: string;
  origemId: string;
  origemNome?: string;
  origem?: {
    id: string;
    nome: string;
  };
}
