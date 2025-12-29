import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const Pagination = ({
  page,
  pageSize,
  total,
  pageSizeOptions = [5, 10, 20],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  return (
    <div className="border-t border-border px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Items per page</span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
            }}
            className="appearance-none bg-background border border-border rounded-md px-3 py-1 pr-8 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          >
            {pageSizeOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <span className="hidden sm:inline">•</span>
        <span>
          Showing {total === 0 ? 0 : startIndex + 1}-{endIndex} of {total}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="sr-only">Previous page</span>
          </button>
          <button
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">Next page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
