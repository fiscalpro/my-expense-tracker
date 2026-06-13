import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Play, RefreshCcw } from "lucide-react";

import { fetchOrigens } from "@/services/origemService";
import {
  createRegra,
  deleteRegra,
  fetchRegras,
  reclassificarDespesasAntigas,
  treinarRegrasEmLote,
} from "@/services/regrasService";
import type { RegraClassificacaoOrigem } from "@/types/regra";
import type { Origem } from "@/types/origem";

const defaultMonth = new Date().toISOString().slice(0, 7);

export default function Regras() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [palavraChave, setPalavraChave] = useState("");
  const [origemId, setOrigemId] = useState("");
  const [mesReferencia, setMesReferencia] = useState(defaultMonth);

  const { data: regras = [], isLoading: isLoadingRegras } = useQuery<RegraClassificacaoOrigem[]>({
    queryKey: ["regras"],
    queryFn: fetchRegras,
  });

  const { data: origens = [], isLoading: isLoadingOrigens } = useQuery<Origem[]>({
    queryKey: ["origens"],
    queryFn: fetchOrigens,
  });

  const createMutation = useMutation({
    mutationFn: createRegra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regras"] });
      toast({ title: "Regra criada com sucesso!" });
      setPalavraChave("");
      setOrigemId("");
    },
    onError: () => {
      toast({ title: "Erro ao criar regra", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regras"] });
      toast({ title: "Regra removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover regra", variant: "destructive" });
    },
  });

  const treinarMutation = useMutation({
    mutationFn: treinarRegrasEmLote,
    onSuccess: (data) => {
      const created = data?.regrasCriadas ?? data?.created ?? data?.count ?? 0;
      toast({
        title: "Treinamento concluído",
        description: `${created} regra(s) criadas`,
      });
      queryClient.invalidateQueries({ queryKey: ["regras"] });
    },
    onError: () => {
      toast({ title: "Erro ao treinar regras", variant: "destructive" });
    },
  });

  const reclassificarMutation = useMutation({
    mutationFn: reclassificarDespesasAntigas,
    onSuccess: (data) => {
      const updated = data?.despesasAtualizadas ?? data?.updated ?? data?.count ?? 0;
      toast({
        title: "Reclassificação concluída",
        description: `${updated} despesa(s) atualizada(s)`,
      });
      queryClient.invalidateQueries({ queryKey: ["regras"] });
    },
    onError: () => {
      toast({ title: "Erro ao reclassificar despesas", variant: "destructive" });
    },
  });

  const handleCreateRule = (event: React.FormEvent) => {
    event.preventDefault();

    if (!palavraChave.trim() || !origemId) {
      toast({ title: "Preencha palavra-chave e origem", variant: "destructive" });
      return;
    }

    createMutation.mutate({ palavraChave: palavraChave.trim(), origemId });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Regras de Classificação</h1>
            <p className="text-sm text-muted-foreground">
              Crie regras e execute rotinas de classificação em lote.
            </p>
          </div>
          <Badge variant="secondary">Sistema de Classificação Automática</Badge>
        </div>
      </div>

      <Tabs defaultValue="regras" className="space-y-4">
        <TabsList className="grid w-full gap-2 md:w-max md:grid-cols-2">
          <TabsTrigger value="regras">Regras</TabsTrigger>
          <TabsTrigger value="automacao">Automação</TabsTrigger>
        </TabsList>

        <TabsContent value="regras" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Cadastro de Regra</CardTitle>
                <Badge variant="secondary">{isLoadingOrigens ? "Carregando orígens..." : `${origens.length} origem(s)`}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 lg:grid-cols-[1fr_18rem]" onSubmit={handleCreateRule}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="palavraChave">Palavra-chave</Label>
                    <Input
                      id="palavraChave"
                      value={palavraChave}
                      onChange={(event) => setPalavraChave(event.target.value)}
                      placeholder="Ex: mercado, netflix"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="origem">Origem</Label>
                    <Select value={origemId} onValueChange={setOrigemId}>
                      <SelectTrigger id="origem">
                        <SelectValue placeholder={isLoadingOrigens ? "Carregando..." : "Selecione uma origem"} />
                      </SelectTrigger>
                      <SelectContent>
                        {origens.map((origem) => (
                          <SelectItem key={origem.id} value={origem.id}>
                            {origem.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="h-12 w-full" disabled={createMutation.isPending || isLoadingOrigens}>
                  {createMutation.isPending ? "Salvando..." : "Salvar Regra"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Regras Cadastradas</CardTitle>
                <Badge variant="secondary">{isLoadingRegras ? "..." : `${regras.length} regra(s)`}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRegras ? (
                <p>Carregando regras...</p>
              ) : regras.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma regra cadastrada ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Palavra-chave</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regras.map((regra) => (
                      <TableRow key={regra.id}>
                        <TableCell>{regra.palavraChave}</TableCell>
                        <TableCell>{regra.origem?.nome ?? regra.origemNome ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => deleteMutation.mutate(regra.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automacao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rotinas de Automação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle>Aprender com Despesas Passadas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      O backend analisará as despesas do mês selecionado e criará novas regras automaticamente.
                    </p>
                    <div className="grid gap-2">
                      <Label htmlFor="mesTreinamento">Mês/ano</Label>
                      <Input
                        id="mesTreinamento"
                        type="month"
                        value={mesReferencia}
                        onChange={(event) => setMesReferencia(event.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => treinarMutation.mutate(mesReferencia)}
                      disabled={treinarMutation.isPending || !mesReferencia}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {treinarMutation.isPending ? "Executando..." : "Treinar Regras"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-border">
                  <CardHeader>
                    <CardTitle>Reclassificar Despesas Antigas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      O backend tentará aplicar regras existentes sobre despesas com origem genérica do mês selecionado.
                    </p>
                    <div className="grid gap-2">
                      <Label htmlFor="mesReclassificacao">Mês/ano</Label>
                      <Input
                        id="mesReclassificacao"
                        type="month"
                        value={mesReferencia}
                        onChange={(event) => setMesReferencia(event.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => reclassificarMutation.mutate(mesReferencia)}
                      disabled={reclassificarMutation.isPending || !mesReferencia}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      {reclassificarMutation.isPending ? "Executando..." : "Reclassificar Despesas"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
