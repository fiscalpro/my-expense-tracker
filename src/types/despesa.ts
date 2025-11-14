export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  status: "NAO_PAGO" | "PAGO";
  origem: string;
  pagador: string;
  competencia: string;
}

export interface DespesaResponse {
  content: Despesa[];
  pageable: {
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}
