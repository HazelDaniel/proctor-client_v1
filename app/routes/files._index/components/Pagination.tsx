import React from "react";
import { Link } from "@remix-run/react";

type PaginationProps = { currentPage: number; totalPages: number; sortBy: string };

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, sortBy }) => {
  const getPageUrl = (page: number) => `?sortBy=${sortBy}&page=${page}`;

  return (
    <nav className="flex items-center justify-center gap-2 mt-4 mb-8">
      {currentPage > 1 && (
        <Link
          to={getPageUrl(currentPage - 1)}
          className="px-3 py-1 rounded-md bg-outline1/20 hover:bg-outline1/40 transition-colors"
        >
          Previous
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          to={getPageUrl(page)}
          className={`px-3 py-1 rounded-md transition-colors ${
            page === currentPage
              ? "bg-[conic-gradient(at_center,purple_30%,rgb(var(--accent-color)),purple)] text-canvas"
              : "bg-outline1/20 hover:bg-outline1/40"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          to={getPageUrl(currentPage + 1)}
          className="px-3 py-1 rounded-md bg-outline1/20 hover:bg-outline1/40 transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
};
