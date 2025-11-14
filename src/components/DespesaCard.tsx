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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg mb-1">
              {despesa.descricao}
            </h3>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(despesa.data)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                <span>{formatCompetencia(despesa.competencia)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(despesa.valor)}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            <span>{despesa.pagador}</span>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {despesa.origem}
            </Badge>
            <Badge 
              variant={despesa.status === "PAGO" ? "default" : "secondary"}
              className={despesa.status === "NAO_PAGO" ? "bg-warning text-warning-foreground" : ""}
            >
              {despesa.status === "NAO_PAGO" ? "Não Pago" : "Pago"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
