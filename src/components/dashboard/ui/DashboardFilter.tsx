import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export interface FilterOption {
  value: string;
  label: string;
}

export interface DashboardFilters {
  periodo?: { from: Date; to: Date } | null;
  vendedor?: string | null;
  ambiente?: string | null;
  origemLead?: string | null;
  fornecedor?: string | null;
  montador?: string | null;
  marceneiro?: string | null;
  material?: string | null;
}

interface DashboardFilterProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  showPeriodo?: boolean;
  showVendedor?: boolean;
  showAmbiente?: boolean;
  showOrigemLead?: boolean;
  showFornecedor?: boolean;
  showMontador?: boolean;
  showMarceneiro?: boolean;
  showMaterial?: boolean;
  vendedorOptions?: FilterOption[];
  ambienteOptions?: FilterOption[];
  origemLeadOptions?: FilterOption[];
  fornecedorOptions?: FilterOption[];
  montadorOptions?: FilterOption[];
  marceineiroOptions?: FilterOption[];
  materialOptions?: FilterOption[];
  className?: string;
}

const PERIODO_PRESETS = [
  { label: "Último mês", value: "1m" },
  { label: "Últimos 3 meses", value: "3m" },
  { label: "Últimos 6 meses", value: "6m" },
  { label: "Este ano", value: "year" },
  { label: "Personalizado", value: "custom" },
];

export function DashboardFilter({
  filters,
  onFilterChange,
  showPeriodo = true,
  showVendedor = false,
  showAmbiente = false,
  showOrigemLead = false,
  showFornecedor = false,
  showMontador = false,
  showMarceneiro = false,
  showMaterial = false,
  vendedorOptions = [],
  ambienteOptions = [],
  origemLeadOptions = [],
  fornecedorOptions = [],
  montadorOptions = [],
  marceineiroOptions = [],
  materialOptions = [],
  className,
}: DashboardFilterProps) {
  const [periodoPreset, setPeriodoPreset] = useState<string>("6m");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.periodo ? { from: filters.periodo.from, to: filters.periodo.to } : undefined
  );

  const handlePeriodoPreset = (preset: string) => {
    setPeriodoPreset(preset);
    const now = new Date();
    let from: Date;
    let to: Date = endOfMonth(now);

    switch (preset) {
      case "1m":
        from = startOfMonth(subMonths(now, 1));
        to = endOfMonth(now);
        break;
      case "3m":
        from = startOfMonth(subMonths(now, 3));
        break;
      case "6m":
        from = startOfMonth(subMonths(now, 6));
        break;
      case "year":
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
        break;
      case "custom":
        return;
      default:
        from = startOfMonth(subMonths(now, 6));
    }

    setDateRange({ from, to });
    onFilterChange({ ...filters, periodo: { from, to } });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onFilterChange({ ...filters, periodo: { from: range.from, to: range.to } });
    }
  };

  const handleClearFilters = () => {
    setPeriodoPreset("6m");
    const now = new Date();
    const from = startOfMonth(subMonths(now, 6));
    const to = endOfMonth(now);
    setDateRange({ from, to });
    onFilterChange({
      periodo: { from, to },
      vendedor: null,
      ambiente: null,
      origemLead: null,
      fornecedor: null,
      montador: null,
      marceneiro: null,
      material: null,
    });
  };

  const hasActiveFilters =
    filters.vendedor ||
    filters.ambiente ||
    filters.origemLead ||
    filters.fornecedor ||
    filters.montador ||
    filters.marceneiro ||
    filters.material;

  return (
    <div className={cn("flex flex-wrap items-center gap-3 mb-6", className)}>
      <Filter className="h-4 w-4 text-muted-foreground" />

      {showPeriodo && (
        <>
          <Select value={periodoPreset} onValueChange={handlePeriodoPreset}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              {PERIODO_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {periodoPreset === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-[260px]",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    "Selecionar período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          )}
        </>
      )}

      {showVendedor && vendedorOptions.length > 0 && (
        <Select
          value={filters.vendedor || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, vendedor: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos vendedores</SelectItem>
            {vendedorOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showAmbiente && ambienteOptions.length > 0 && (
        <Select
          value={filters.ambiente || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, ambiente: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ambiente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos ambientes</SelectItem>
            {ambienteOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showOrigemLead && origemLeadOptions.length > 0 && (
        <Select
          value={filters.origemLead || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, origemLead: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Origem Lead" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas origens</SelectItem>
            {origemLeadOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showFornecedor && fornecedorOptions.length > 0 && (
        <Select
          value={filters.fornecedor || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, fornecedor: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Fornecedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos fornecedores</SelectItem>
            {fornecedorOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showMontador && montadorOptions.length > 0 && (
        <Select
          value={filters.montador || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, montador: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Montador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos montadores</SelectItem>
            {montadorOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showMarceneiro && marceineiroOptions.length > 0 && (
        <Select
          value={filters.marceneiro || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, marceneiro: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Marceneiro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos marceneiros</SelectItem>
            {marceineiroOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showMaterial && materialOptions.length > 0 && (
        <Select
          value={filters.material || "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, material: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos materiais</SelectItem>
            {materialOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="gap-1"
        >
          <X className="h-3 w-3" />
          Limpar
        </Button>
      )}
    </div>
  );
}
