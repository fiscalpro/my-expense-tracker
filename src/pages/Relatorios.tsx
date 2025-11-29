import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CalendarIcon, BarChart3, Search, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TipoRelatorio = "origem" | "pagador" | "tipo-origem";
type TipoFiltro = "competencia" | "periodo";

interface RelatorioOrigem {
  origem: string;
  custoTotal: number;
}

interface RelatorioPagador {
  pagador: string;
  custoTotal: number;
}

interface RelatorioTipoOrigem {
  tipoOrigem: string;
  custoTotal: number;
}

type RelatorioData = RelatorioOrigem[] | RelatorioPagador[] | RelatorioTipoOrigem[];

interface FiltrosRelatorio {
  tipoRelatorio: TipoRelatorio;
  tipoFiltro: TipoFiltro;
  dataInicio?: Date;
  dataFim?: Date;
  dataCompetencia?: Date;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--destructive))',
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(262, 83%, 58%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 82%, 52%)',
  'hsl(199, 89%, 48%)',
];

const tipoOrigemLabels: Record<string, string> = {
  "LAZER": "Lazer",
  "RESTAURANTE": "Restaurante",
  "SUPERMERCADO": "Supermercado",
  "FARMACIA": "Farmácia",
  "ASSINATURA": "Assinatura",
  "COMBUSTIVEL": "Combustível",
  "COMPRAS": "Compras",
  "SAUDE": "Saúde",
  "JUROS": "Juros",
  "INFRA_TRABALHO": "Infraestrutura de Trabalho",
  "PET": "Pet",
  "PERFUMARIA_VESTUARIO": "Perfumaria e Vestuário",
  "EDUCACAO": "Educação",
};

const fetchRelatorio = async (filtros: FiltrosRelatorio): Promise<RelatorioData> => {
  const params = new URLSearchParams();

  if (filtros.tipoFiltro === "competencia" && filtros.dataCompetencia) {
    params.append('dataCompetencia', format(filtros.dataCompetencia, 'yyyy-MM-dd'));
  } else if (filtros.tipoFiltro === "periodo") {
    if (filtros.dataInicio) {
      params.append('dataInicio', format(filtros.dataInicio, 'yyyy-MM-dd'));
    }
    if (filtros.dataFim) {
      params.append('dataFim', format(filtros.dataFim, 'yyyy-MM-dd'));
    }
  }

  let endpoint = "";
  switch (filtros.tipoRelatorio) {
    case "origem":
      endpoint = "custo-por-origem";
      break;
    case "pagador":
      endpoint = "custo-por-pagador";
      break;
    case "tipo-origem":
      endpoint = "custo-por-tipo-origem";
      break;
  }

  const response = await fetch(`http://localhost:8080/relatorios/${endpoint}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Falha ao carregar relatório');
  }
  return response.json();
};

const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const Relatorios = () => {
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    tipoRelatorio: "origem",
    tipoFiltro: "competencia",
    dataCompetencia: firstDayOfMonth,
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosRelatorio>(filtros);

  const { data, isLoading, error } = useQuery({
    queryKey: ['relatorio', filtrosAplicados],
    queryFn: () => fetchRelatorio(filtrosAplicados),
  });

  const handleBuscar = () => {
    setFiltrosAplicados({ ...filtros });
  };

  const getChartData = () => {
    if (!data) return [];
    
    return data.map((item: any) => {
      const label = 'origem' in item 
        ? item.origem 
        : 'pagador' in item 
        ? item.pagador 
        : tipoOrigemLabels[item.tipoOrigem] || item.tipoOrigem;
      
      return {
        name: label,
        valor: item.custoTotal,
      };
    });
  };

  const getTotal = () => {
    if (!data) return 0;
    return data.reduce((acc: number, item: any) => acc + item.custoTotal, 0);
  };

  const getTipoRelatorioLabel = () => {
    switch (filtrosAplicados.tipoRelatorio) {
      case "origem": return "por Origem";
      case "pagador": return "por Pagador";
      case "tipo-origem": return "por Tipo de Origem";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          </div>
          <p className="text-muted-foreground">
            Visualize e analise seus gastos por diferentes categorias
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Relatório */}
              <div className="space-y-2">
                <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
                <Select
                  value={filtros.tipoRelatorio}
                  onValueChange={(value: TipoRelatorio) =>
                    setFiltros({ ...filtros, tipoRelatorio: value })
                  }
                >
                  <SelectTrigger id="tipo-relatorio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="origem">Por Origem</SelectItem>
                    <SelectItem value="pagador">Por Pagador</SelectItem>
                    <SelectItem value="tipo-origem">Por Tipo de Origem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Filtro */}
              <div className="space-y-2">
                <Label htmlFor="tipo-filtro">Filtrar por</Label>
                <Select
                  value={filtros.tipoFiltro}
                  onValueChange={(value: TipoFiltro) =>
                    setFiltros({ ...filtros, tipoFiltro: value })
                  }
                >
                  <SelectTrigger id="tipo-filtro">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competencia">Competência</SelectItem>
                    <SelectItem value="periodo">Período</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data Competência ou Período */}
            {filtros.tipoFiltro === "competencia" ? (
              <div className="space-y-2">
                <Label>Data de Competência</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filtros.dataCompetencia && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.dataCompetencia ? (
                        format(filtros.dataCompetencia, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filtros.dataCompetencia}
                      onSelect={(date) =>
                        setFiltros({ ...filtros, dataCompetencia: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filtros.dataInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtros.dataInicio ? (
                          format(filtros.dataInicio, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filtros.dataInicio}
                        onSelect={(date) =>
                          setFiltros({ ...filtros, dataInicio: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filtros.dataFim && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtros.dataFim ? (
                          format(filtros.dataFim, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filtros.dataFim}
                        onSelect={(date) =>
                          setFiltros({ ...filtros, dataFim: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <div className="flex justify-start">
              <Button onClick={handleBuscar}>
                <Search className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Erro ao carregar relatório. Verifique se o backend está rodando em http://localhost:8080
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <>
            {/* Total Card */}
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Custo Total {getTipoRelatorioLabel()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(getTotal())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Gráficos e Tabela */}
            <Tabs defaultValue="graficos" className="space-y-4">
              <TabsList>
                <TabsTrigger value="graficos">Gráficos</TabsTrigger>
                <TabsTrigger value="tabela">Tabela</TabsTrigger>
              </TabsList>

              <TabsContent value="graficos" className="space-y-4">
                {/* Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Barras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="valor" fill="hsl(var(--primary))" name="Valor" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Pizza</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={getChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={120}
                          fill="hsl(var(--primary))"
                          dataKey="valor"
                        >
                          {getChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tabela">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Detalhados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {filtrosAplicados.tipoRelatorio === "origem"
                              ? "Origem"
                              : filtrosAplicados.tipoRelatorio === "pagador"
                              ? "Pagador"
                              : "Tipo de Origem"}
                          </TableHead>
                          <TableHead className="text-right">Custo Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((item: any, index: number) => {
                          const label = 'origem' in item 
                            ? item.origem 
                            : 'pagador' in item 
                            ? item.pagador 
                            : tipoOrigemLabels[item.tipoOrigem] || item.tipoOrigem;
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{label}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.custoTotal)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {data && data.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum dado encontrado para os filtros selecionados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Relatorios;
