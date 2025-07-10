"use client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import React from "react";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
