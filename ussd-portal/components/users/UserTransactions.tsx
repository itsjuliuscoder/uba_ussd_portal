"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserTransactionsProps {
  userId: number;
}

export function UserTransactions({ userId }: UserTransactionsProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["user-transactions", userId, page],
    queryFn: () => usersApi.getTransactions(userId, { page, limit: 10 }),
  });

  const transactions = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      success: "default",
      completed: "default",
      SUCCESS: "default",
      pending: "secondary",
      failed: "destructive",
      error: "destructive",
    };
    return (
      <Badge variant={statusMap[status.toLowerCase()] || "outline"}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.transactionId || "N/A"}
                </TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
