"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

export default function TestThemePage() {
  const { resolvedTheme } = useTheme();
  const [count, setCount] = useState(0);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Theme Test Page</CardTitle>
            <ThemeToggle />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Current theme: <strong>{resolvedTheme}</strong>
            </p>
            <div className="bg-background text-foreground border border-border p-4 rounded-md">
              <p>This box uses theme colors</p>
              <p className="text-primary">This text uses primary color</p>
              <p className="text-secondary">This text uses secondary color</p>
              <p className="text-muted-foreground">
                This text uses muted foreground
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => setCount((prev) => prev + 1)}
                className="bg-primary hover:bg-primary/90"
              >
                Clicked {count} times
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
