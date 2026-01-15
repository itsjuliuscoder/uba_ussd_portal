"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { User } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Eye, Edit, UserCheck, UserX, Key } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [resetPinDialogOpen, setResetPinDialogOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [generateRandom, setGenerateRandom] = useState(false);

  const enableMutation = useMutation({
    mutationFn: () => usersApi.enable(user.id),
    onSuccess: () => {
      toast.success("User enabled successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEnableDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to enable user");
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => usersApi.disable(user.id),
    onSuccess: () => {
      toast.success("User disabled successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDisableDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to disable user");
    },
  });

  const resetPinMutation = useMutation({
    mutationFn: () =>
      usersApi.resetPin(user.id, {
        newPin: generateRandom ? undefined : newPin,
        generateRandom,
      }),
    onSuccess: (data) => {
      if (data.data.temporaryPin) {
        toast.success(
          `PIN reset successfully. Temporary PIN: ${data.data.temporaryPin}`
        );
      } else {
        toast.success("PIN reset successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setResetPinDialogOpen(false);
      setNewPin("");
      setGenerateRandom(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset PIN");
    },
  });

  const handleResetPin = () => {
    if (!generateRandom && (!newPin || newPin.length !== 4)) {
      toast.error("PIN must be 4 digits");
      return;
    }
    resetPinMutation.mutate();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {user.accountStatus === "active" ? (
            <DropdownMenuItem onClick={() => setDisableDialogOpen(true)}>
              <UserX className="mr-2 h-4 w-4" />
              Disable
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setEnableDialogOpen(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Enable
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setResetPinDialogOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            Reset PIN
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable User</DialogTitle>
            <DialogDescription>
              Are you sure you want to enable {user.walletId}? This will allow
              them to use the USSD service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEnableDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => enableMutation.mutate()}
              disabled={enableMutation.isPending}
            >
              Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable User</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable {user.walletId}? This will
              prevent them from using the USSD service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDisableDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => disableMutation.mutate()}
              disabled={disableMutation.isPending}
            >
              Disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPinDialogOpen} onOpenChange={setResetPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset PIN</DialogTitle>
            <DialogDescription>
              Reset the PIN for {user.walletId}. You can generate a random PIN
              or set a custom one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="generateRandom"
                checked={generateRandom}
                onChange={(e) => {
                  setGenerateRandom(e.target.checked);
                  if (e.target.checked) setNewPin("");
                }}
                className="h-4 w-4"
              />
              <label htmlFor="generateRandom" className="text-sm font-medium">
                Generate random PIN
              </label>
            </div>
            {!generateRandom && (
              <div>
                <label htmlFor="newPin" className="text-sm font-medium">
                  New PIN (4 digits)
                </label>
                <Input
                  id="newPin"
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="0000"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPinDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPin}
              disabled={resetPinMutation.isPending}
            >
              Reset PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
