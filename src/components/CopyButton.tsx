import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to your clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Your browser blocked copying — select the text instead.");
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      onClick={() => void copy()}
      className={`rounded-full ${className}`}
    >
      {copied ? <Check className="mr-1.5 size-4" /> : <Copy className="mr-1.5 size-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
