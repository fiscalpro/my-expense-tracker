export interface Pagador {
  id: string;
  nome: string;
  tipoPagamentoEnum: string;
  diaFatura?: number;
  diaFechamento?: number;
}

export interface PagadorResponse {
  content: Pagador[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
}
