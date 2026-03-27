import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { CalendarIcon, TrendingUp, Search, GitCompareArrows } from "lucide-react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TipoComparativo = "custo-total" | "origem" | "pagador" | "tipo-origem";

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(262, 83%, 58%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 82%, 52%)',
  'hsl(199, 89%, 48%)',
  'hsl(var(--primary))',
  'hsl(var(--destructive))',
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

interface ComparativoTotalItem {
  mesReferencia: string;
  custoTotal: number;
}

interface ComparativoPagadorItem {
  mesReferencia: string;
  custosPorPagador: { pagador: string; custoTotal: number }[];
}

interface ComparativoTipoOrigemItem {
  mesReferencia: string;
  custosPorTipoOrigem: { tipoOrigem: string; custoTotal: number }[];
}

interface ComparativoOrigemItem {
  mesReferencia: string;
  custosPorOrigem: { origem: string; custoTotal: number }[];
}

type ComparativoResponse = {
  comparativoMensal: ComparativoTotalItem[] | ComparativoPagadorItem[] | ComparativoTipoOrigemItem[] | ComparativoOrigemItem[];
};

const formatMesLabel = (mesRef: string) => {
  try {
    const date = parse(mesRef, "yyyy-MM", new Date());
    return format(date, "MMM/yyyy", { locale: ptBR });
  } catch {
    return mesRef;
  }
};

const fetchComparativo = async (tipo: TipoComparativo, dataCompetencia?: Date): Promise<ComparativoResponse> => {
  const params = new URLSearchParams();
  if (dataCompetencia) {
    params.append('dataCompetencia', format(dataCompetencia, 'yyyy-MM-dd'));
  }

  const endpointMap: Record<TipoComparativo, string> = {
    "custo-total": "custo-total-comparativo",
    "origem": "custo-por-origem-comparativo",
    "pagador": "custo-por-pagador-comparativo",
    "tipo-origem": "custo-por-tipo-origem-comparativo",
  };

  const response = await fetch(`http://localhost:8080/relatorios/${endpointMap[tipo]}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Falha ao carregar relatório comparativo');
  }
  return response.json();
};

const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const RelatoriosComparativos = () => {
  const [tipo, setTipo] = useState<TipoComparativo>("custo-total");
  const [dataCompetencia, setDataCompetencia] = useState<Date | undefined>(firstDayOfMonth);
  const [filtrosAplicados, setFiltrosAplicados] = useState({ tipo, dataCompetencia });

  const { data, isLoading, error } = useQuery({
    queryKey: ['comparativo', filtrosAplicados],
    queryFn: () => fetchComparativo(filtrosAplicados.tipo, filtrosAplicados.dataCompetencia),
  });

  const handleBuscar = () => {
    setFiltrosAplicados({ tipo, dataCompetencia });
  };

  const getTipoLabel = () => {
    switch (filtrosAplicados.tipo) {
      case "custo-total": return "Custo Total";
      case "origem": return "por Origem";
      case "pagador": return "por Pagador";
      case "tipo-origem": return "por Tipo de Origem";
    }
  };

  // Build chart data for custo-total (simple line/bar)
  const getCustoTotalChartData = () => {
    if (!data) return [];
    const items = data.comparativoMensal as ComparativoTotalItem[];
    return [...items].reverse().map((item) => ({
      mes: formatMesLabel(item.mesReferencia),
      valor: item.custoTotal,
    }));
  };

  // Build grouped bar data for pagador/origem/tipo-origem
  const getGroupedChartData = () => {
    if (!data) return { chartData: [] as any[], keys: [] as string[] };

    const mensal = data.comparativoMensal;
    const allKeys = new Set<string>();
    const chartData: any[] = [];

    const reversed = [...mensal].reverse();

    reversed.forEach((item: any) => {
      const row: any = { mes: formatMesLabel(item.mesReferencia) };
      const custos = item.custosPorPagador || item.custosPorOrigem || item.custosPorTipoOrigem || [];
      custos.forEach((c: any) => {
        const key = c.pagador || c.origem || (tipoOrigemLabels[c.tipoOrigem] || c.tipoOrigem);
        allKeys.add(key);
        row[key] = c.custoTotal;
      });
      chartData.push(row);
    });

    return { chartData, keys: Array.from(allKeys) };
  };

  const renderCustoTotalCharts = () => {
    const chartData = getCustoTotalChartData();
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução Mensal - Barras</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                <Bar dataKey="valor" fill="hsl(var(--primary))" name="Custo Total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução Mensal - Linha</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="valor" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 5 }} name="Custo Total" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGroupedCharts = () => {
    const { chartData, keys } = getGroupedChartData();
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparativo Trimestral - Barras Agrupadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                <Legend />
                {keys.map((key, i) => (
                  <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} name={key} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução por Categoria - Linhas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                <Legend />
                {keys.map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} name={key} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTable = () => {
    if (!data) return null;

    if (filtrosAplicados.tipo === "custo-total") {
      const items = data.comparativoMensal as ComparativoTotalItem[];
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead className="text-right">Custo Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...items].reverse().map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{formatMesLabel(item.mesReferencia)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.custoTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    // Grouped table
    const { chartData, keys } = getGroupedChartData();
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mês</TableHead>
            {keys.map((key) => (
              <TableHead key={key} className="text-right">{key}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {chartData.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{row.mes}</TableCell>
              {keys.map((key) => (
                <TableCell key={key} className="text-right">
                  {row[key] != null ? formatCurrency(row[key]) : "-"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GitCompareArrows className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Evolução Trimestral</h1>
          </div>
          <p className="text-muted-foreground">
            Acompanhe a evolução dos seus gastos nos últimos 3 meses
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Comparativo</Label>
                <Select value={tipo} onValueChange={(v: TipoComparativo) => setTipo(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custo-total">Custo Total</SelectItem>
                    <SelectItem value="origem">Por Origem</SelectItem>
                    <SelectItem value="pagador">Por Pagador</SelectItem>
                    <SelectItem value="tipo-origem">Por Tipo de Origem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mês de Referência</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataCompetencia && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataCompetencia
                        ? format(dataCompetencia, "MMMM yyyy", { locale: ptBR })
                        : "Selecione um mês"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataCompetencia}
                      onSelect={setDataCompetencia}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-start">
              <Button onClick={handleBuscar}>
                <Search className="h-4 w-4 mr-2" />
                Gerar Comparativo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Erro ao carregar relatório comparativo. Verifique se o backend está rodando em http://localhost:8080
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <>
            {/* Summary */}
            <Card className="mb-6 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Evolução Trimestral — {getTipoLabel()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {data.comparativoMensal.length} meses analisados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="graficos" className="space-y-4">
              <TabsList>
                <TabsTrigger value="graficos">Gráficos</TabsTrigger>
                <TabsTrigger value="tabela">Tabela</TabsTrigger>
              </TabsList>

              <TabsContent value="graficos" className="space-y-4">
                {filtrosAplicados.tipo === "custo-total"
                  ? renderCustoTotalCharts()
                  : renderGroupedCharts()}
              </TabsContent>

              <TabsContent value="tabela">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Comparativos</CardTitle>
                  </CardHeader>
                  <CardContent>{renderTable()}</CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {data && data.comparativoMensal.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum dado encontrado para o período selecionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
};

export default RelatoriosComparativos;
