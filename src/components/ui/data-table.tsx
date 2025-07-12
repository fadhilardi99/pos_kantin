import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  description?: string;
  itemsPerPage?: number;
  searchable?: boolean;
  sortable?: boolean;
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  searchFields?: string[];
}

export function DataTable({
  data,
  columns,
  title,
  description,
  itemsPerPage = 10,
  searchable = true,
  sortable = true,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = "Tidak ada data",
  className = "",
  searchFields,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((row) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const value = row[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      // fallback ke columns
      return columns.some((column) => {
        const value = row[column.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Handle sorting
  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <Card className={`border-amber-200 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle className="text-amber-800">{title}</CardTitle>}
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-amber-200">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`text-left p-4 font-semibold text-amber-800 ${
                          sortable && column.sortable !== false
                            ? "cursor-pointer hover:bg-amber-50"
                            : ""
                        }`}
                        style={{ width: column.width }}
                        onClick={() =>
                          column.sortable !== false && handleSort(column.key)
                        }
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          {sortable &&
                            column.sortable !== false &&
                            getSortIcon(column.key)}
                        </div>
                      </th>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <th className="text-left p-4 font-semibold text-amber-800 w-24">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (onEdit || onDelete || onView ? 1 : 0)
                        }
                        className="text-center py-8 text-gray-500"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className={`border-b border-amber-100 hover:bg-amber-50 transition-colors ${
                          onRowClick ? "cursor-pointer" : ""
                        }`}
                        onClick={() => onRowClick?.(row)}
                      >
                        {columns.map((column) => (
                          <td key={column.key} className="p-4">
                            {column.render
                              ? column.render(row[column.key], row)
                              : row[column.key] ?? "-"}
                          </td>
                        ))}
                        {(onEdit || onDelete || onView) && (
                          <td className="p-4">
                            <div className="flex items-center space-x-1">
                              {onView && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onView(row);
                                  }}
                                  className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              {onEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(row);
                                  }}
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {onDelete && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(row);
                                  }}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, sortedData.length)} dari{" "}
                  {sortedData.length} data
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "border-amber-300 text-amber-700 hover:bg-amber-50"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
