export interface Origem {
  id: string;
  nome: string;
}

export interface OrigemResponse {
  content: Origem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
}
