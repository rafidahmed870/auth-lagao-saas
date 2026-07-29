import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { UsersRound, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function TeamContent() {
  const features = [
    "Invite team members by email",
    "Role-based access control (RBAC)",
    "Per-resource permission scoping",
    "Audit logs for team actions",
    "Revoke access instantly",
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 max-w-lg mx-auto text-center space-y-6">
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <UsersRound className="w-9 h-9 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-primary" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          Coming Soon
        </div>
        <h2 className="text-2xl font-bold font-space-grotesk text-foreground">
          Team Management
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Collaborate with your team, assign roles, and control access to your
          applications — all from one place. This feature is currently in
          development.
        </p>
      </motion.div>

      {/* Feature list */}
      <motion.ul
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="space-y-2 w-full text-left"
      >
        {features.map((feat, i) => (
          <li
            key={i}
            className="flex items-center gap-2.5 py-2.5 px-4 rounded-lg border border-border bg-card/40 text-sm text-foreground/80"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            {feat}
          </li>
        ))}
      </motion.ul>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 w-full justify-center"
      >
        <Link
          to="/dashboard/overview"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          Back to Overview
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <a
          href="https://github.com/rafidahmed870/auth-lagao-saas"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent/60 transition-colors"
        >
          Star on GitHub
        </a>
      </motion.div>
    </div>
  );
}

export default function Team() {
  return (
    <DashboardLayout>
      <TeamContent />
    </DashboardLayout>
  );
}


