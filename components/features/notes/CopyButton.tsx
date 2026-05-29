"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { nl } from "@/lib/i18n/nl";

interface CopyButtonProps extends Omit<ButtonProps, "children"> {
  value: string;
  label?: string;
  copiedLabel?: string;
  iconOnly?: boolean;
}

export function CopyButton({
  value,
  label = nl.note.copy,
  copiedLabel = nl.note.copied,
  iconOnly = false,
  variant = "outline",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon" : "default"}
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      {...props}
    >
      {copied ? <Check className="text-brand-500" /> : <Copy />}
      {!iconOnly && (copied ? copiedLabel : label)}
    </Button>
  );
}
