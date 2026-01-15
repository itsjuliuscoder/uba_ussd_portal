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
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserSessionsProps {
  userId: number;
}

export function UserSessions({ userId }: UserSessionsProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["user-sessions", userId, page],
    queryFn: () => usersApi.getSessions(userId, { page, limit: 10 }),
  });

  const sessions = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session ID</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Question Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No sessions found
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">
                  {session.sessionId}
                </TableCell>
                <TableCell>{session.wallet || "N/A"}</TableCell>
                <TableCell>{session.language || "N/A"}</TableCell>
                <TableCell>{session.questionType || "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      session.closeState === "1" ? "secondary" : "default"
                    }
                  >
                    {session.closeState === "1" ? "Closed" : "Open"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(session.createdAt)}</TableCell>
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
