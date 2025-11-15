import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Despesa } from "@/types/despesa";
import { formatCurrency, formatDate, formatCompetencia } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";

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

interface VisualizarDespesaDialogProps {
  despesaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DespesaDetalhada extends Despesa {
  origem: string;
  pagador: string;
  origemId?: string;
  pagadorId?: string;
}

interface EditForm {
  descricao: string;
  valor: number;
  data: string;
  status: string;
  origemId: string;
  origemForm?: {
    nome: string;
    tipoOrigem: TipoOrigemEnum;
  };
  pagadorId: string;
}

const fetchDespesaById = async (id: string): Promise<DespesaDetalhada> => {
  const response = await fetch(`http://localhost:8080/despesas/${id}`);
  if (!response.ok) throw new Error("Erro ao carregar despesa");
  return response.json();
};

export function VisualizarDespesaDialog({ despesaId, open, onOpenChange }: VisualizarDespesaDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [usarOrigemExistente, setUsarOrigemExistente] = useState(true);

  const { data: despesa, isLoading } = useQuery({
    queryKey: ["despesa", despesaId],
    queryFn: () => fetchDespesaById(despesaId),
    enabled: open && !!despesaId,
  });

  const [formData, setFormData] = useState<EditForm>({
    descricao: "",
    valor: 0,
    data: "",
    status: "NAO_PAGO",
    origemId: "",
    origemForm: {
      nome: "",
      tipoOrigem: "LAZER",
    },
    pagadorId: "",
  });

  useEffect(() => {
    if (despesa) {
      setFormData({
        descricao: despesa.descricao,
        valor: despesa.valor,
        data: despesa.data,
        status: despesa.status,
        origemId: despesa.origemId || "",
        pagadorId: despesa.pagadorId || "",
      });
    }
  }, [despesa]);

  const mutation = useMutation({
    mutationFn: async (data: EditForm) => {
      const payload = {
        ...data,
        origemId: usarOrigemExistente ? data.origemId : undefined,
        origemForm: !usarOrigemExistente ? data.origemForm : undefined,
      };

      const response = await fetch(`http://localhost:8080/despesas/${despesaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Erro ao atualizar despesa");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas"] });
      queryClient.invalidateQueries({ queryKey: ["despesa", despesaId] });
      toast({
        title: "Despesa atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      setIsEditing(false);
      setUsarOrigemExistente(true);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a despesa.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleCancel = () => {
    if (despesa) {
      setFormData({
        descricao: despesa.descricao,
        valor: despesa.valor,
        data: despesa.data,
        status: despesa.status,
        origemId: despesa.origemId || "",
        origemForm: {
          nome: "",
          tipoOrigem: "LAZER",
        },
        pagadorId: despesa.pagadorId || "",
      });
    }
    setIsEditing(false);
    setUsarOrigemExistente(true);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!despesa) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes da Despesa</span>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
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

            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NAO_PAGO">Não Pago</SelectItem>
                  <SelectItem value="PAGO">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-2">
              <PagadorSearch
                value={formData.pagadorId}
                onSelect={(id) => setFormData({ ...formData, pagadorId: id })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Descrição</Label>
                <p className="font-medium">{despesa.descricao}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Valor</Label>
                <p className="font-medium text-lg">{formatCurrency(despesa.valor)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Data</Label>
                <p className="font-medium">{formatDate(despesa.data)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={despesa.status === "PAGO" ? "default" : "secondary"}>
                    {despesa.status === "NAO_PAGO" ? "Não Pago" : "Pago"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Origem</Label>
                <p className="font-medium">{despesa.origem}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Pagador</Label>
                <p className="font-medium">{despesa.pagador}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Competência</Label>
                <p className="font-medium">{formatCompetencia(despesa.competencia)}</p>
              </div>
              {despesa.numeroParcela !== null && despesa.totalParcela !== null && (
                <div>
                  <Label className="text-muted-foreground">Parcela</Label>
                  <p className="font-medium">{despesa.numeroParcela}/{despesa.totalParcela}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
