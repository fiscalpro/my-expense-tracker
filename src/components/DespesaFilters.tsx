import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";

export const DespesaFilters = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <p className="text-sm">Espaço reservado para filtros futuros</p>
        </div>
      </CardContent>
    </Card>
  );
};
