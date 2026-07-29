/**
 * Reusable confirm/alert dialog built on shadcn AlertDialog.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Delete License"
 *     description="This cannot be undone."
 *     confirmLabel="Delete"        // default "Continue"
 *     variant="destructive"        // "destructive" | "default"
 *     loading={deleting}
 *     onConfirm={handleDelete}
 *   />
 */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  variant = "destructive",
  loading = false,
  onConfirm,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm border-border bg-card text-foreground ring-border/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-space-grotesk text-base">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="bg-transparent border-t-0 -mx-0 -mb-0 px-0 pb-0 sm:flex-row sm:gap-2">
          {/* Cancel */}
          <button
            type="button"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="cursor-pointer flex-1 sm:flex-none px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent/60 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          {/* Confirm */}
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              "cursor-pointer flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50",
              variant === "destructive"
                ? "bg-destructive text-white hover:bg-destructive/80"
                : "bg-primary text-primary-foreground hover:bg-primary/80"
            )}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
