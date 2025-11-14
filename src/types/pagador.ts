export interface Pagador {
  id: string;
  nome: string;
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
