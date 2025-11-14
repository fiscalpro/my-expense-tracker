import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { OrigemResponse } from "@/types/origem";

interface OrigemSearchProps {
  value: string;
  onSelect: (id: string, nome: string) => void;
}

export function OrigemSearch({ value, onSelect }: OrigemSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNome, setSelectedNome] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["origens", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return null;
      const response = await fetch(
        `http://localhost:8080/origem?nome=${encodeURIComponent(searchTerm)}&page=0&size=10`
      );
      if (!response.ok) throw new Error("Erro ao buscar origens");
      return response.json() as Promise<OrigemResponse>;
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
      <Label htmlFor="origem-search">Origem</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="origem-search"
          placeholder="Buscar origem..."
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
          {data?.content.map((origem) => (
            <Card
              key={origem.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSelect(origem.id, origem.nome)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{origem.nome}</span>
                  {value === origem.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.content.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">
              Nenhuma origem encontrada
            </p>
          )}
        </div>
      )}
    </div>
  );
}
