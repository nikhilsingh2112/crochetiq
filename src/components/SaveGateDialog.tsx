import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SaveGateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <div className="mb-2 grid size-12 place-items-center rounded-2xl bg-warm-gradient">
            <Sparkles className="size-6 text-foreground/70" />
          </div>
          <DialogTitle className="font-display text-2xl">Keep this project safe?</DialogTitle>
          <DialogDescription className="text-base">
            Create a free account to save your crochet projects, revisit your captions any time,
            and collect the ideas you love in your own dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button asChild className="rounded-full">
            <Link to="/auth" search={{ mode: "signup" }}>
              Create free account
            </Link>
          </Button>
          <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
            Keep exploring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
