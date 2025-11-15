import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Building2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PagadorSearch } from "@/components/PagadorSearch";
import { OrigemSearch } from "@/components/OrigemSearch";

type TipoOrigemEnum = "LAZER" | "RESTAURANTE" | "SUPERMERCADO" | "FARMACIA" | "ASSINATURA" | "COMBUSTIVEL" | "COMPRAS" | "SAUDE" | "JUROS" | "INFRA_TRABALHO" | "PET" | "PERFUMARIA_VESTUARIO";

const tiposOrigem: { value: TipoOrigemEnum; label: string }[] = [
  { value: "LAZER", label: "Lazer" },
  { value: "RESTAURANTE", label: "Restaurante" },
  { value: "SUPERMERCADO", label: "Supermercado" },
  { value: "FARMACIA", label: "Farmácia" },
  { value: "ASSINATURA", label: "Assinatura" },
  { value: "COMBUSTIVEL", label: "Combustível" },
  { value: "COMPRAS", label: "Compras" },
  { value: "SAUDE", label: "Saúde" },
  { value: "JUROS", label: "Juros" },
  { value: "INFRA_TRABALHO", label: "Infraestrutura de Trabalho" },
  { value: "PET", label: "Pet" },
  { value: "PERFUMARIA_VESTUARIO", label: "Perfumaria e Vestuário" },
];

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
  origemForm?: {
    nome: string;
    tipoOrigem: TipoOrigemEnum;
  };
  pagadorId: string;
}

export function NovaDespesaDialog() {
  const [open, setOpen] = useState(false);
  const [incluirParcela, setIncluirParcela] = useState(false);
  const [usarOrigemExistente, setUsarOrigemExistente] = useState(true);
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
    origemForm: {
      nome: "",
      tipoOrigem: "LAZER",
    },
    pagadorId: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: NovaDespesaForm) => {
      const payload = {
        ...data,
        parcelaForm: incluirParcela ? data.parcelaForm : undefined,
        origemId: usarOrigemExistente ? data.origemId : undefined,
        origemForm: !usarOrigemExistente ? data.origemForm : undefined,
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
      setIncluirParcela(false);
      setUsarOrigemExistente(true);
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
        origemForm: {
          nome: "",
          tipoOrigem: "LAZER",
        },
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="incluirParcela"
              checked={incluirParcela}
              onCheckedChange={(checked) => setIncluirParcela(checked as boolean)}
            />
            <Label htmlFor="incluirParcela" className="cursor-pointer">
              Incluir informações de parcela
            </Label>
          </div>

          {incluirParcela && (
            <>
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
            </>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Origem</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUsarOrigemExistente(!usarOrigemExistente)}
              >
                <Building2 className="h-4 w-4 mr-2" />
                {usarOrigemExistente ? 'Cadastrar Nova Origem' : 'Usar Origem Existente'}
              </Button>
            </div>

            {usarOrigemExistente ? (
              <OrigemSearch
                value={formData.origemId}
                onSelect={(id) => setFormData({ ...formData, origemId: id })}
              />
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="origemNome">Nome da Origem</Label>
                  <Input
                    id="origemNome"
                    value={formData.origemForm?.nome || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        origemForm: {
                          ...formData.origemForm!,
                          nome: e.target.value,
                        },
                      })
                    }
                    placeholder="Digite o nome da origem"
                    required={!usarOrigemExistente}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origemTipo">Tipo da Origem</Label>
                  <Select
                    value={formData.origemForm?.tipoOrigem}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        origemForm: {
                          ...formData.origemForm!,
                          tipoOrigem: value as TipoOrigemEnum,
                        },
                      })
                    }
                  >
                    <SelectTrigger id="origemTipo">
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
              </div>
            )}
          </div>

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
