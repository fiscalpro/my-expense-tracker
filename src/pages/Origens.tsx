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
import { Origem } from "@/types/origem";

type TipoOrigemEnum = "LAZER" | "RESTAURANTE" | "SUPERMERCADO" | "FARMACIA" | "ASSINATURA" | "COMBUSTIVEL" | "COMPRAS" | "SAUDE";

const tiposOrigem: { value: TipoOrigemEnum; label: string }[] = [
  { value: "LAZER", label: "Lazer" },
  { value: "RESTAURANTE", label: "Restaurante" },
  { value: "SUPERMERCADO", label: "Supermercado" },
  { value: "FARMACIA", label: "Farmácia" },
  { value: "ASSINATURA", label: "Assinatura" },
  { value: "COMBUSTIVEL", label: "Combustível" },
  { value: "COMPRAS", label: "Compras" },
  { value: "SAUDE", label: "Saúde" },
];

const fetchOrigens = async (): Promise<Origem[]> => {
  const response = await fetch("http://localhost:8080/origem");
  if (!response.ok) throw new Error("Erro ao carregar origens");
  const data = await response.json();
  return data.content || [];
};

const createOrigem = async (origem: { nome: string; tipoOrigem: TipoOrigemEnum }) => {
  const response = await fetch("http://localhost:8080/origem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(origem),
  });
  if (!response.ok) throw new Error("Erro ao criar origem");
  return response.json();
};

export default function Origens() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [tipoOrigem, setTipoOrigem] = useState<TipoOrigemEnum>("LAZER");

  const { data: origens = [], isLoading } = useQuery({
    queryKey: ["origens"],
    queryFn: fetchOrigens,
  });

  const mutation = useMutation({
    mutationFn: createOrigem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["origens"] });
      toast({ title: "Origem criada com sucesso!" });
      setOpen(false);
      setNome("");
      setTipoOrigem("LAZER");
    },
    onError: () => {
      toast({ title: "Erro ao criar origem", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    mutation.mutate({ nome: nome.trim(), tipoOrigem });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Origens</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Origem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Origem</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome da origem"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoOrigem">Tipo</Label>
                <Select value={tipoOrigem} onValueChange={(value) => setTipoOrigem(value as TipoOrigemEnum)}>
                  <SelectTrigger id="tipoOrigem">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposOrigem.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          {origens.map((origem) => (
            <Card key={origem.id}>
              <CardHeader>
                <CardTitle>{origem.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">ID: {origem.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
