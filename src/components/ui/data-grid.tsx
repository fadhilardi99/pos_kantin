import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  Edit,
  Trash2,
  Grid3X3,
} from "lucide-react";

interface DataGridProps {
  data: any[];
  title?: string;
  description?: string;
  itemsPerPage?: number;
  searchable?: boolean;
  onItemClick?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  renderItem: (item: any) => React.ReactNode;
  searchFields?: string[];
  addButton?: React.ReactNode;
}

export function DataGrid({
  data,
  title,
  description,
  itemsPerPage = 12,
  searchable = true,
  onItemClick,
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = "Tidak ada data",
  className = "",
  renderItem,
  searchFields,
  addButton,
}: DataGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) => {
      if (searchFields) {
        return searchFields.some((field) => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      // Default search through all string/number fields
      return Object.values(item).some((value) => {
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchFields]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
            {addButton}
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
            {paginatedData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">{emptyMessage}</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-2">
                    Tidak ada hasil untuk "{searchTerm}"
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedData.map((item, index) => (
                  <Card
                    key={item.id || index}
                    className={`border-amber-200 shadow-sm hover:shadow-lg transition-all duration-200 ${
                      onItemClick ? "cursor-pointer hover:scale-105" : ""
                    }`}
                    onClick={() => onItemClick?.(item)}
                  >
                    <CardContent className="p-4">
                      {renderItem(item)}

                      {/* Action buttons */}
                      {(onEdit || onDelete || onView) && (
                        <div className="flex items-center justify-end space-x-1 mt-3 pt-3 border-t border-amber-100">
                          {onView && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(item);
                              }}
                              className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                              }}
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item);
                              }}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                  dari {filteredData.length} data
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
