import Link from "next/link";
import { cn } from "@/lib/utils";

export function PaginationControls({
  currentPage,
  totalPages,
  baseUrl,
  params,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    search.set("page", String(page));
    return `${baseUrl}?${search.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Link
        href={hrefFor(currentPage - 1)}
        className={cn(
          "px-3 py-1 text-sm border rounded-lg bg-card transition-colors hover:bg-muted",
          currentPage <= 1 && "pointer-events-none opacity-50"
        )}
      >
        Prev
      </Link>
      <span className="text-sm text-muted-foreground tabular-nums">
        {currentPage} / {totalPages}
      </span>
      <Link
        href={hrefFor(currentPage + 1)}
        className={cn(
          "px-3 py-1 text-sm border rounded-lg bg-card transition-colors hover:bg-muted",
          currentPage >= totalPages && "pointer-events-none opacity-50"
        )}
      >
        Next
      </Link>
    </div>
  );
}