import { useState } from "react";
import ClientSidebar from "./ClientSidebar";
import ClientHeader from "./ClientHeader";
import { ClientProvider } from "@/context/ClientContext";

/**
 * Shell layout for all dashboard pages.
 * Provides the sidebar, header, and a scrollable content area.
 * Wraps everything with ClientProvider so dashboard state is available.
 */
export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ClientProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <ClientSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <ClientHeader onMobileMenuToggle={() => setMobileOpen((p) => !p)} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </ClientProvider>
  );
}

