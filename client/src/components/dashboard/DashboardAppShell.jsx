import { Outlet } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { ClientProvider } from "@/context/ClientContext";

export default function DashboardAppShell() {
  return (
    <ClientProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ClientProvider>
  );
}
