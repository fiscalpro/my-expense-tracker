import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface DespesaFiltersData {
  nomeOrigem: string;
  nomePagador: string;
  statusDespesaEnum: string;
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
}

export const DespesaFilters = ({ filters, onFiltersChange, pageSize, onPageSizeChange }: DespesaFiltersProps) => {
  const handleClearFilters = () => {
    onFiltersChange({
      nomeOrigem: "",
      nomePagador: "",
      statusDespesaEnum: "",
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
    filters.dataCompetencia || 
    filters.dataCompetenciaInicio || 
    filters.dataCompetenciaFim;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filtros</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Label>Competência - Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dataCompetenciaInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataCompetenciaInicio ? (
                    format(filters.dataCompetenciaInicio, "PPP", { locale: ptBR })
                  ) : (
                    <span>Data inicial</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dataCompetenciaInicio}
                  onSelect={(date) => onFiltersChange({ ...filters, dataCompetenciaInicio: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Competência Fim */}
          <div className="space-y-2">
            <Label>Competência - Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dataCompetenciaFim && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataCompetenciaFim ? (
                    format(filters.dataCompetenciaFim, "PPP", { locale: ptBR })
                  ) : (
                    <span>Data final</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dataCompetenciaFim}
                  onSelect={(date) => onFiltersChange({ ...filters, dataCompetenciaFim: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
      </CardContent>
    </Card>
  );
};
