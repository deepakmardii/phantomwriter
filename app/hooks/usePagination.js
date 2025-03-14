"use client";
import { useState, useCallback } from "react";

export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const nextPage = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  const previousPage = useCallback(() => {
    if (page > 1 && !loading) {
      setPage((prev) => prev - 1);
    }
  }, [page, loading]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    setTotal(0);
  }, [initialPage]);

  const updatePaginationState = useCallback((paginationData) => {
    setHasMore(paginationData.hasMore);
    setTotal(paginationData.totalPosts);
  }, []);

  return {
    page,
    limit,
    hasMore,
    total,
    loading,
    setLoading,
    nextPage,
    previousPage,
    resetPagination,
    updatePaginationState,
    totalPages: Math.ceil(total / limit),
  };
}
