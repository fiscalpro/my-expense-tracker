import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DespesaCard } from "@/components/DespesaCard";
import { DespesaFilters } from "@/components/DespesaFilters";
import { DespesaPagination } from "@/components/DespesaPagination";
import { NovaDespesaDialog } from "@/components/NovaDespesaDialog";
import { DespesaResponse } from "@/types/despesa";
import { Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const fetchDespesas = async (page: number, size: number): Promise<DespesaResponse> => {
  const response = await fetch(`http://localhost:8080/despesas?page=${page}&size=${size}`);
  if (!response.ok) {
    throw new Error('Falha ao carregar despesas');
  }
  return response.json();
};

const Index = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 11;

  const { data, isLoading, error } = useQuery({
    queryKey: ['despesas', currentPage, pageSize],
    queryFn: () => fetchDespesas(currentPage, pageSize),
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Controle de Gastos</h1>
            </div>
            <p className="text-muted-foreground">
              Gerencie suas despesas pessoais de forma simples e organizada
            </p>
          </div>
          <NovaDespesaDialog />
        </div>

        {/* Filters */}
        <DespesaFilters />

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar despesas. Verifique se o backend está rodando em http://localhost:8080
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {/* Content */}
        {data && !isLoading && (
          <>
            <div className="space-y-4">
              {data.content.map((despesa) => (
                <DespesaCard key={despesa.id} despesa={despesa} />
              ))}
            </div>

            {data.content.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
              </div>
            )}

            {data.content.length > 0 && (
              <DespesaPagination
                currentPage={data.number}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
