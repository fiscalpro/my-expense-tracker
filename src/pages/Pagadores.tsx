import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pagador } from "@/types/pagador";

type TipoPagamentoEnum = "CREDITO" | "DEBITO";

const tiposPagamento: { value: TipoPagamentoEnum; label: string }[] = [
  { value: "CREDITO", label: "Crédito" },
  { value: "DEBITO", label: "Débito" },
];

const fetchPagadores = async (): Promise<Pagador[]> => {
  const response = await fetch("http://localhost:8080/pagador");
  if (!response.ok) throw new Error("Erro ao carregar pagadores");
  const data = await response.json();
  return data.content || [];
};

const createPagador = async (pagador: {
  nome: string;
  tipoPagamentoEnum: TipoPagamentoEnum;
  diaFatura: number | null;
  diaFechamento: number | null;
}) => {
  const response = await fetch("http://localhost:8080/pagador", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pagador),
  });
  if (!response.ok) throw new Error("Erro ao criar pagador");
  return response.json();
};

export default function Pagadores() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamentoEnum>("CREDITO");
  const [diaFatura, setDiaFatura] = useState("");
  const [diaFechamento, setDiaFechamento] = useState("");

  const { data: pagadores = [], isLoading } = useQuery({
    queryKey: ["pagadores"],
    queryFn: fetchPagadores,
  });

  const mutation = useMutation({
    mutationFn: createPagador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagadores"] });
      toast({ title: "Pagador criado com sucesso!" });
      setOpen(false);
      setNome("");
      setTipoPagamento("CREDITO");
      setDiaFatura("");
      setDiaFechamento("");
    },
    onError: () => {
      toast({ title: "Erro ao criar pagador", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    const diaFaturaNum = diaFatura ? parseInt(diaFatura) : null;
    const diaFechamentoNum = diaFechamento ? parseInt(diaFechamento) : null;

    if (diaFaturaNum && (diaFaturaNum < 1 || diaFaturaNum > 31)) {
      toast({ title: "Dia da fatura deve estar entre 1 e 31", variant: "destructive" });
      return;
    }

    if (diaFechamentoNum && (diaFechamentoNum < 1 || diaFechamentoNum > 31)) {
      toast({ title: "Dia do fechamento deve estar entre 1 e 31", variant: "destructive" });
      return;
    }

    mutation.mutate({
      nome: nome.trim(),
      tipoPagamentoEnum: tipoPagamento,
      diaFatura: diaFaturaNum,
      diaFechamento: diaFechamentoNum,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pagadores</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pagador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Pagador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do pagador"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoPagamento">Tipo de Pagamento</Label>
                <Select value={tipoPagamento} onValueChange={(value) => setTipoPagamento(value as TipoPagamentoEnum)}>
                  <SelectTrigger id="tipoPagamento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposPagamento.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diaFatura">Dia da Fatura (opcional)</Label>
                <Input
                  id="diaFatura"
                  type="number"
                  min="1"
                  max="31"
                  value={diaFatura}
                  onChange={(e) => setDiaFatura(e.target.value)}
                  placeholder="1-31"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diaFechamento">Dia do Fechamento (opcional)</Label>
                <Input
                  id="diaFechamento"
                  type="number"
                  min="1"
                  max="31"
                  value={diaFechamento}
                  onChange={(e) => setDiaFechamento(e.target.value)}
                  placeholder="1-31"
                />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pagadores.map((pagador) => (
            <Card key={pagador.id}>
              <CardHeader>
                <CardTitle>{pagador.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">ID: {pagador.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
