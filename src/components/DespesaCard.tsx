import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Despesa } from "@/types/despesa";
import { formatCurrency, formatDate, formatCompetencia } from "@/utils/formatters";
import { Calendar, CreditCard, Tag, Layers } from "lucide-react";

interface DespesaCardProps {
  despesa: Despesa;
  onClick?: () => void;
}

export const DespesaCard = ({ despesa, onClick }: DespesaCardProps) => {
  return (
    <Card className="hover:shadow-sm transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Descrição e Origem */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-medium text-foreground truncate">
              {despesa.descricao}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{despesa.origem}</span>
            </div>
          </div>

          {/* Data */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground min-w-[90px]">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">{formatDate(despesa.data)}</span>
          </div>

          {/* Pagador */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground min-w-[100px]">
            <CreditCard className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap truncate">{despesa.pagador}</span>
          </div>

          {/* Parcela */}
          <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground min-w-[70px]">
            {despesa.numeroParcela !== null && despesa.totalParcela !== null && (
              <>
                <Layers className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">{despesa.numeroParcela}/{despesa.totalParcela}</span>
              </>
            )}
          </div>

          {/* Status */}
          <Badge 
            variant={despesa.status === "PAGO" ? "default" : "secondary"}
            className={`whitespace-nowrap min-w-[80px] justify-center ${despesa.status === "NAO_PAGO" ? "bg-warning text-warning-foreground" : ""}`}
          >
            {despesa.status === "NAO_PAGO" ? "Não Pago" : "Pago"}
          </Badge>

          {/* Valor */}
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
