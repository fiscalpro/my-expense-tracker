import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Despesa } from "@/types/despesa";
import { formatCurrency, formatDate, formatCompetencia } from "@/utils/formatters";
import { Calendar, CreditCard, Tag } from "lucide-react";

interface DespesaCardProps {
  despesa: Despesa;
}

export const DespesaCard = ({ despesa }: DespesaCardProps) => {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          {/* Descrição - flex 1 para ocupar espaço disponível */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {despesa.descricao}
            </h3>
          </div>

          {/* Data */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">{formatDate(despesa.data)}</span>
          </div>

          {/* Pagador */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">{despesa.pagador}</span>
          </div>

          {/* Competência */}
          <div className="hidden lg:block text-sm text-muted-foreground">
            <span className="whitespace-nowrap">{formatCompetencia(despesa.competencia)}</span>
          </div>

          {/* Status */}
          <Badge 
            variant={despesa.status === "PAGO" ? "default" : "secondary"}
            className={`whitespace-nowrap ${despesa.status === "NAO_PAGO" ? "bg-warning text-warning-foreground" : ""}`}
          >
            {despesa.status === "NAO_PAGO" ? "Não Pago" : "Pago"}
          </Badge>

          {/* Valor - sempre visível */}
          <div className="text-right min-w-[100px]">
            <p className="text-lg font-bold text-foreground whitespace-nowrap">
              {formatCurrency(despesa.valor)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
