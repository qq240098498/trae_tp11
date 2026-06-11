import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
