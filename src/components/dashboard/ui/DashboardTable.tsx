import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DashboardTableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  showPagination?: boolean;
  highlightCondition?: (row: T) => boolean;
  highlightColor?: "warning" | "success" | "danger";
  totalRow?: {
    label: string;
    values: Record<string, string | number>;
  };
  emptyMessage?: string;
  className?: string;
}

const highlightColors = {
  warning: "bg-dashboard-warning/20",
  success: "bg-dashboard-success/20",
  danger: "bg-dashboard-danger/20",
};

export function DashboardTable<T>({
  data,
  columns,
  itemsPerPage = 5,
  showPagination = true,
  highlightCondition,
  highlightColor = "warning",
  totalRow,
  emptyMessage = "Nenhum dado encontrado",
  className,
}: DashboardTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = showPagination
    ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : data;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getCellValue = (row: T, key: string): unknown => {
    const rowAny = row as Record<string, unknown>;
    if (key.includes(".")) {
      const keys = key.split(".");
      let value: unknown = row;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      return value;
    }
    return rowAny[key];
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-dashboard-navy hover:bg-dashboard-navy">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    "text-dashboard-navy-foreground font-semibold",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      highlightCondition?.(row) && highlightColors[highlightColor]
                    )}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={String(col.key)}
                        className={cn(
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(row)
                          : String(getCellValue(row, String(col.key)) ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {totalRow && (
                  <TableRow className="bg-muted font-semibold">
                    {columns.map((col, index) => (
                      <TableCell
                        key={String(col.key)}
                        className={cn(
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center"
                        )}
                      >
                        {index === 0
                          ? totalRow.label
                          : totalRow.values[String(col.key)] ?? ""}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, data.length)} de {data.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
