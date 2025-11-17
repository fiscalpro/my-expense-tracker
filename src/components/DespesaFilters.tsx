import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";

export interface DespesaFiltersData {
  nomeOrigem: string;
  nomePagador: string;
  statusDespesaEnum: string;
  tipoDespesa: string;
  dataCompetencia: Date | undefined;
  dataCompetenciaInicio: Date | undefined;
  dataCompetenciaFim: Date | undefined;
  ordenacao: "data" | "valor";
}

interface DespesaFiltersProps {
  filters: DespesaFiltersData;
  onFiltersChange: (filters: DespesaFiltersData) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const DespesaFilters = ({ filters, onFiltersChange, pageSize, onPageSizeChange, showFilters, onToggleFilters }: DespesaFiltersProps) => {
  const handleClearFilters = () => {
    onFiltersChange({
      nomeOrigem: "",
      nomePagador: "",
      statusDespesaEnum: "",
      tipoDespesa: "",
      dataCompetencia: undefined,
      dataCompetenciaInicio: undefined,
      dataCompetenciaFim: undefined,
      ordenacao: "data",
    });
  };

  const hasActiveFilters = 
    filters.nomeOrigem || 
    filters.nomePagador || 
    filters.statusDespesaEnum || 
    filters.tipoDespesa || 
    filters.dataCompetencia || 
    filters.dataCompetenciaInicio || 
    filters.dataCompetenciaFim;

  return (
    <Card className="mb-6">
      <CardContent className={showFilters ? "p-4" : "p-0"}>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-4 rounded-lg transition-colors"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filtros</h3>
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-4">
          {/* Nome Origem */}
          <div className="space-y-2">
            <Label htmlFor="nomeOrigem">Origem</Label>
            <Input
              id="nomeOrigem"
              placeholder="Buscar por origem..."
              value={filters.nomeOrigem}
              onChange={(e) => onFiltersChange({ ...filters, nomeOrigem: e.target.value })}
            />
          </div>

          {/* Nome Pagador */}
          <div className="space-y-2">
            <Label htmlFor="nomePagador">Pagador</Label>
            <Input
              id="nomePagador"
              placeholder="Buscar por pagador..."
              value={filters.nomePagador}
              onChange={(e) => onFiltersChange({ ...filters, nomePagador: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.statusDespesaEnum}
              onValueChange={(value) => onFiltersChange({ ...filters, statusDespesaEnum: value })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="NAO_PAGO">Não Pago</SelectItem>
                <SelectItem value="PAGO">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Despesa */}
          <div className="space-y-2">
            <Label htmlFor="tipoDespesa">Tipo de Despesa</Label>
            <Select
              value={filters.tipoDespesa}
              onValueChange={(value) => onFiltersChange({ ...filters, tipoDespesa: value })}
            >
              <SelectTrigger id="tipoDespesa">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="LAZER">Lazer</SelectItem>
                <SelectItem value="RESTAURANTE">Restaurante</SelectItem>
                <SelectItem value="SUPERMERCADO">Supermercado</SelectItem>
                <SelectItem value="FARMACIA">Farmácia</SelectItem>
                <SelectItem value="ASSINATURA">Assinatura</SelectItem>
                <SelectItem value="COMBUSTIVEL">Combustível</SelectItem>
                <SelectItem value="COMPRAS">Compras</SelectItem>
                <SelectItem value="SAUDE">Saúde</SelectItem>
                <SelectItem value="JUROS">Juros</SelectItem>
                <SelectItem value="INFRA_TRABALHO">Infra Trabalho</SelectItem>
                <SelectItem value="PET">Pet</SelectItem>
                <SelectItem value="PERFUMARIA_VESTUARIO">Perfumaria/Vestuário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Competência */}
          <div className="space-y-2">
            <Label>Competência (Mês/Ano)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.dataCompetencia ? format(filters.dataCompetencia, "M") : ""}
                onValueChange={(month) => {
                  const year = filters.dataCompetencia ? filters.dataCompetencia.getFullYear() : new Date().getFullYear();
                  const newDate = new Date(year, parseInt(month) - 1, 1);
                  onFiltersChange({ ...filters, dataCompetencia: newDate });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.dataCompetencia ? filters.dataCompetencia.getFullYear().toString() : ""}
                onValueChange={(year) => {
                  const month = filters.dataCompetencia ? filters.dataCompetencia.getMonth() : new Date().getMonth();
                  const newDate = new Date(parseInt(year), month, 1);
                  onFiltersChange({ ...filters, dataCompetencia: newDate });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Competência Início */}
          <div className="space-y-2">
            <Label>Competência Início (Mês/Ano)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.dataCompetenciaInicio ? format(filters.dataCompetenciaInicio, "M") : ""}
                onValueChange={(month) => {
                  const year = filters.dataCompetenciaInicio ? filters.dataCompetenciaInicio.getFullYear() : new Date().getFullYear();
                  const newDate = new Date(year, parseInt(month) - 1, 1);
                  onFiltersChange({ ...filters, dataCompetenciaInicio: newDate });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.dataCompetenciaInicio ? filters.dataCompetenciaInicio.getFullYear().toString() : ""}
                onValueChange={(year) => {
                  const month = filters.dataCompetenciaInicio ? filters.dataCompetenciaInicio.getMonth() : new Date().getMonth();
                  const newDate = new Date(parseInt(year), month, 1);
                  onFiltersChange({ ...filters, dataCompetenciaInicio: newDate });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Competência Fim */}
          <div className="space-y-2">
            <Label>Competência Fim (Mês/Ano)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.dataCompetenciaFim ? format(filters.dataCompetenciaFim, "M") : ""}
                onValueChange={(month) => {
                  const year = filters.dataCompetenciaFim ? filters.dataCompetenciaFim.getFullYear() : new Date().getFullYear();
                  const newDate = new Date(year, parseInt(month) - 1, 1);
                  onFiltersChange({ ...filters, dataCompetenciaFim: newDate });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.dataCompetenciaFim ? filters.dataCompetenciaFim.getFullYear().toString() : ""}
                onValueChange={(year) => {
                  const month = filters.dataCompetenciaFim ? filters.dataCompetenciaFim.getMonth() : new Date().getMonth();
                  const newDate = new Date(parseInt(year), month, 1);
                  onFiltersChange({ ...filters, dataCompetenciaFim: newDate });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ordenação */}
          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select
              value={filters.ordenacao}
              onValueChange={(value: "data" | "valor") => 
                onFiltersChange({ ...filters, ordenacao: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a ordenação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data">Data (mais recente)</SelectItem>
                <SelectItem value="valor">Valor (maior)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Itens por página */}
          <div className="space-y-2">
            <Label>Itens por página</Label>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
