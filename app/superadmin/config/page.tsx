"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/platform/config");
      const data = await res.json();
      setConfigs(data);
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any, description?: string) => {
    setSaving(key);
    try {
      const res = await fetch("/api/superadmin/platform/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, description }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">
          Configure platform settings and preferences
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Manage platform-wide configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configs.map((config) => (
                <div key={config.key} className="space-y-2">
                  <Label htmlFor={config.key}>{config.key}</Label>
                  <Textarea
                    id={config.key}
                    defaultValue={JSON.stringify(config.value, null, 2)}
                    rows={4}
                    className="font-mono text-sm"
                  />
                  {config.description && (
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  )}
                  <Button
                    onClick={() => {
                      const textarea = document.getElementById(
                        config.key
                      ) as HTMLTextAreaElement;
                      if (textarea) {
                        try {
                          const value = JSON.parse(textarea.value);
                          handleSave(config.key, value, config.description);
                        } catch (e) {
                          alert("Invalid JSON");
                        }
                      }
                    }}
                    disabled={saving === config.key}
                  >
                    {saving === config.key ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
