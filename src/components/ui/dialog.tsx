"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Dialog({
  open,
  onOpenChange,
  children
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup dialog"
        className="absolute inset-0 bg-primary/85 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

function DialogContent({
  className,
  onClose,
  children
}: React.HTMLAttributes<HTMLDivElement> & { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "absolute left-1/2 top-1/2 max-h-[92vh] w-[min(94vw,1100px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-3xl border border-accent/40 bg-white p-5 shadow-2xl",
        className
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute right-4 top-4 z-10"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      {children}
    </div>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2 pr-14", className)} {...props} />;
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-2xl font-bold text-primary [font-family:var(--font-playfair)]",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle };
