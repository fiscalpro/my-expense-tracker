import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
}

export const DespesaFilters = ({ filters, onFiltersChange }: DespesaFiltersProps) => {
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
              className="ml-auto"
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
            <Label>Data Competência</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dataCompetencia && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataCompetencia ? (
                    format(filters.dataCompetencia, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dataCompetencia}
                  onSelect={(date) => onFiltersChange({ ...filters, dataCompetencia: date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
            <RadioGroup
              value={filters.ordenacao}
              onValueChange={(value: "data" | "valor") => 
                onFiltersChange({ ...filters, ordenacao: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="data" id="ord-data" />
                <Label htmlFor="ord-data" className="font-normal cursor-pointer">Data (mais recente)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="valor" id="ord-valor" />
                <Label htmlFor="ord-valor" className="font-normal cursor-pointer">Valor (maior)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
