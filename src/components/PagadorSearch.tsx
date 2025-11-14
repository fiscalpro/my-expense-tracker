import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PagadorResponse } from "@/types/pagador";

interface PagadorSearchProps {
  value: string;
  onSelect: (id: string, nome: string) => void;
}

export function PagadorSearch({ value, onSelect }: PagadorSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNome, setSelectedNome] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["pagadores", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return null;
      const response = await fetch(
        `http://localhost:8080/pagador?nome=${encodeURIComponent(searchTerm)}&page=0&size=10`
      );
      if (!response.ok) throw new Error("Erro ao buscar pagadores");
      return response.json() as Promise<PagadorResponse>;
    },
    enabled: searchTerm.length > 0,
  });

  const handleSelect = (id: string, nome: string) => {
    onSelect(id, nome);
    setSelectedNome(nome);
    setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="pagador-search">Pagador</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="pagador-search"
          placeholder="Buscar pagador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {selectedNome && !searchTerm && (
        <Card className="border-primary">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedNome}</span>
              <Check className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {searchTerm && (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {isLoading && (
            <p className="text-sm text-muted-foreground p-2">Buscando...</p>
          )}
          {data?.content.map((pagador) => (
            <Card
              key={pagador.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSelect(pagador.id, pagador.nome)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{pagador.nome}</span>
                  {value === pagador.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.content.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">
              Nenhum pagador encontrado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
