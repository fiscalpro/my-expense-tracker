import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PagadorSearch } from "@/components/PagadorSearch";
import { OrigemSearch } from "@/components/OrigemSearch";

interface NovaDespesaForm {
  descricao: string;
  valor: number;
  data: string;
  parcelaForm: {
    tipoParcela: string;
    total: number;
    numeroOriginal: number;
  };
  origemId: string;
  pagadorId: string;
}

export function NovaDespesaDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<NovaDespesaForm>({
    descricao: "",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    parcelaForm: {
      tipoParcela: "COMPRA",
      total: 1,
      numeroOriginal: 1,
    },
    origemId: "",
    pagadorId: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: NovaDespesaForm) => {
      // Só envia parcelaForm se algum campo foi realmente preenchido
      const hasParcelaData = 
        data.parcelaForm.tipoParcela !== "COMPRA" || 
        data.parcelaForm.total !== 1 || 
        data.parcelaForm.numeroOriginal !== 1;

      const payload = {
        ...data,
        parcelaForm: hasParcelaData ? data.parcelaForm : undefined,
      };

      const response = await fetch("http://localhost:8080/despesas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Erro ao criar despesa");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      toast({
        title: "Despesa criada!",
        description: "A despesa foi adicionada com sucesso.",
      });
      setOpen(false);
      setFormData({
        descricao: "",
        valor: 0,
        data: new Date().toISOString().split("T")[0],
        parcelaForm: {
          tipoParcela: "COMPRA",
          total: 1,
          numeroOriginal: 1,
        },
        origemId: "",
        pagadorId: "",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a despesa.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Despesa</DialogTitle>
          <DialogDescription>
            Preencha os dados da despesa para adicionar ao seu controle financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) =>
                  setFormData({ ...formData, valor: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) =>
                  setFormData({ ...formData, data: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoParcela">Tipo de Parcela</Label>
            <Select
              value={formData.parcelaForm.tipoParcela}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  parcelaForm: { ...formData.parcelaForm, tipoParcela: value },
                })
              }
            >
              <SelectTrigger id="tipoParcela">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPRA">Compra</SelectItem>
                <SelectItem value="PARCELADO">Parcelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total">Total de Parcelas</Label>
              <Input
                id="total"
                type="number"
                min="1"
                value={formData.parcelaForm.total}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parcelaForm: {
                      ...formData.parcelaForm,
                      total: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroOriginal">Número Original</Label>
              <Input
                id="numeroOriginal"
                type="number"
                min="1"
                value={formData.parcelaForm.numeroOriginal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parcelaForm: {
                      ...formData.parcelaForm,
                      numeroOriginal: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          <OrigemSearch
            value={formData.origemId}
            onSelect={(id) => setFormData({ ...formData, origemId: id })}
          />

          <PagadorSearch
            value={formData.pagadorId}
            onSelect={(id) => setFormData({ ...formData, pagadorId: id })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
