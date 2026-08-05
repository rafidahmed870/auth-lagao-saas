import { ShieldOff } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Full-page access denied state shown when a team member navigates to a
 * section they don't have permission for.
 *
 * Props
 * ─────
 *   permission  – the slug that was missing, e.g. "app.license.view"
 *   pageName    – human label shown in the message, e.g. "Licenses"
 */
export default function AccessDenied({ permission, pageName = "this page" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center py-28 gap-5 text-center max-w-sm mx-auto"
    >
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <ShieldOff className="w-7 h-7 text-destructive/70" />
      </div>

      <div className="space-y-1.5">
        <p className="text-base font-bold font-space-grotesk text-foreground">
          Access Denied
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You don't have permission to view <span className="text-foreground font-medium">{pageName}</span> for this application.
        </p>
        {permission && (
          <p className="text-xs text-muted-foreground/70 mt-1">
            Required permission:{" "}
            <code className="font-mono bg-secondary/60 px-1.5 py-0.5 rounded text-[11px]">
              {permission}
            </code>
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground/60">
        Contact the application owner to request access.
      </p>
    </motion.div>
  );
}
