"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { operatorsApi } from "@/lib/api/operators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function OperatorsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    network_id: "",
    country: "",
    status: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["operators"],
    queryFn: () => operatorsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: operatorsApi.create,
    onSuccess: () => {
      toast.success("Operator created successfully");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create operator");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      operatorsApi.update(id, data),
    onSuccess: () => {
      toast.success("Operator updated successfully");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update operator");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: operatorsApi.delete,
    onSuccess: () => {
      toast.success("Operator deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete operator");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: boolean }) =>
      operatorsApi.toggleStatus(id, status),
    onSuccess: () => {
      toast.success("Operator status updated");
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", network_id: "", country: "", status: true });
    setEditingOperator(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOperator) {
      updateMutation.mutate({
        id: editingOperator.id,
        data: {
          name: formData.name,
          network_id: parseInt(formData.network_id),
          country: formData.country,
          status: formData.status,
        },
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        network_id: parseInt(formData.network_id),
        country: formData.country,
        status: formData.status,
      });
    }
  };

  const operators = data?.data?.operators || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operators</h1>
          <p className="text-muted-foreground">Manage network operators</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Operator
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Operators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Network ID</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : operators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No operators found
                  </TableCell>
                </TableRow>
              ) : (
                operators.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell className="font-medium">
                      {operator.name}
                    </TableCell>
                    <TableCell>{operator.network_id}</TableCell>
                    <TableCell>{operator.country}</TableCell>
                    <TableCell>
                      <Badge
                        variant={operator.status ? "default" : "secondary"}
                      >
                        {operator.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingOperator(operator);
                            setFormData({
                              name: operator.name,
                              network_id: operator.network_id.toString(),
                              country: operator.country,
                              status: operator.status,
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this operator?"
                              )
                            ) {
                              deleteMutation.mutate(operator.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: operator.id,
                              status: !operator.status,
                            })
                          }
                        >
                          {operator.status ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOperator ? "Edit Operator" : "Add Operator"}
            </DialogTitle>
            <DialogDescription>
              {editingOperator
                ? "Update operator information"
                : "Create a new network operator"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Network ID</label>
                <Input
                  type="number"
                  value={formData.network_id}
                  onChange={(e) =>
                    setFormData({ ...formData, network_id: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="status"
                  checked={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <label htmlFor="status" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingOperator ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
