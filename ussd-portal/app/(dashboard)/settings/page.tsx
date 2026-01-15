"use client";

import { useQuery } from "@tanstack/react-query";
import { configApi } from "@/lib/api/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["config"],
    queryFn: () => configApi.get(),
  });

  const config = data?.data?.config;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          System configuration and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">System Name</label>
                <p className="text-lg">{config?.systemName || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Version</label>
                <p className="text-lg">{config?.version || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Supported Wallets</label>
                <p className="text-lg">
                  {config?.supportedWallets?.join(", ") || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Supported Languages
                </label>
                <p className="text-lg">
                  {config?.supportedLanguages?.join(", ") || "N/A"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
