import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DespesaCard } from "@/components/DespesaCard";
import { DespesaFilters, DespesaFiltersData } from "@/components/DespesaFilters";
import { DespesaPagination } from "@/components/DespesaPagination";
import { NovaDespesaDialog } from "@/components/NovaDespesaDialog";
import { VisualizarDespesaDialog } from "@/components/VisualizarDespesaDialog";
import { DespesaResponse } from "@/types/despesa";
import { Wallet, AlertCircle, TrendingUp, Filter, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";

const fetchDespesas = async (
  page: number, 
  size: number, 
  filters: DespesaFiltersData
): Promise<DespesaResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filters.nomeOrigem) params.append('nomeOrigem', filters.nomeOrigem);
  if (filters.nomePagador) params.append('nomePagador', filters.nomePagador);
  if (filters.statusDespesaEnum && filters.statusDespesaEnum !== 'all') {
    params.append('statusDespesaEnum', filters.statusDespesaEnum);
  }
  if (filters.dataCompetencia) {
    params.append('dataCompetencia', format(filters.dataCompetencia, 'yyyy-MM-dd'));
  }
  if (filters.dataCompetenciaInicio) {
    params.append('dataCompetenciaInicio', format(filters.dataCompetenciaInicio, 'yyyy-MM-dd'));
  }
  if (filters.dataCompetenciaFim) {
    params.append('dataCompetenciaFim', format(filters.dataCompetenciaFim, 'yyyy-MM-dd'));
  }
  
  // Adiciona ordenação
  const sortField = filters.ordenacao === "data" ? "data" : "valor";
  params.append('sort', `${sortField},desc`);

  const response = await fetch(`http://localhost:8080/despesas?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Falha ao carregar despesas');
  }
  return response.json();
};

const fetchCustoTotal = async (filters: DespesaFiltersData): Promise<{ custoTotal: number }> => {
  const params = new URLSearchParams();

  if (filters.nomeOrigem) params.append('nomeOrigem', filters.nomeOrigem);
  if (filters.nomePagador) params.append('nomePagador', filters.nomePagador);
  if (filters.statusDespesaEnum && filters.statusDespesaEnum !== 'all') {
    params.append('statusDespesaEnum', filters.statusDespesaEnum);
  }
  if (filters.dataCompetencia) {
    params.append('dataCompetencia', format(filters.dataCompetencia, 'yyyy-MM-dd'));
  }
  if (filters.dataCompetenciaInicio) {
    params.append('dataCompetenciaInicio', format(filters.dataCompetenciaInicio, 'yyyy-MM-dd'));
  }
  if (filters.dataCompetenciaFim) {
    params.append('dataCompetenciaFim', format(filters.dataCompetenciaFim, 'yyyy-MM-dd'));
  }

  const response = await fetch(`http://localhost:8080/relatorios/custo-total?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Falha ao carregar custo total');
  }
  return response.json();
};

const Index = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDespesaId, setSelectedDespesaId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<DespesaFiltersData>({
    nomeOrigem: "",
    nomePagador: "",
    statusDespesaEnum: "",
    dataCompetencia: undefined,
    dataCompetenciaInicio: undefined,
    dataCompetenciaFim: undefined,
    ordenacao: "data",
  });
  const [appliedFilters, setAppliedFilters] = useState<DespesaFiltersData>(filters);

  const { data, isLoading, error } = useQuery({
    queryKey: ['despesas', currentPage, pageSize, appliedFilters],
    queryFn: () => fetchDespesas(currentPage, pageSize, appliedFilters),
  });

  const { data: custoTotalData, isLoading: isLoadingCustoTotal } = useQuery({
    queryKey: ['custoTotal', appliedFilters],
    queryFn: () => fetchCustoTotal(appliedFilters),
  });

  const handleFiltersChange = (newFilters: DespesaFiltersData) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(0);
  };

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
        <DespesaFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(0);
          }}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
        {showFilters && (
          <div className="mb-6 flex justify-end">
            <Button onClick={handleSearch} size="default">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        )}

        {/* Custo Total Card */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Custo Total</p>
                  <p className="text-xs text-muted-foreground">da pesquisa atual</p>
                </div>
              </div>
              <div className="text-right">
                {isLoadingCustoTotal ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    {custoTotalData ? formatCurrency(custoTotalData.custoTotal) : 'R$ 0,00'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
                <DespesaCard 
                  key={despesa.id} 
                  despesa={despesa}
                  onClick={() => setSelectedDespesaId(despesa.id)}
                />
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

        {/* Visualizar/Editar Despesa Dialog */}
        {selectedDespesaId && (
          <VisualizarDespesaDialog
            despesaId={selectedDespesaId}
            open={!!selectedDespesaId}
            onOpenChange={(open) => !open && setSelectedDespesaId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
