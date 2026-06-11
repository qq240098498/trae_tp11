import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calculator,
  ClipboardList,
  Settings,
  Truck,
  PlusCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/",
    label: "仪表盘",
    icon: LayoutDashboard,
  },
  {
    path: "/operation-board",
    label: "运营看板",
    icon: BarChart3,
  },
  {
    path: "/quote",
    label: "报价计算",
    icon: Calculator,
  },
  {
    path: "/orders",
    label: "记录管理",
    icon: ClipboardList,
  },
  {
    path: "/orders/new",
    label: "新建订单",
    icon: PlusCircle,
  },
  {
    path: "/damage-claims",
    label: "损坏丢失登记",
    icon: AlertTriangle,
  },
  {
    path: "/standards",
    label: "费用标准",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white min-h-screen flex flex-col shadow-xl">
      <div className="p-6 border-b border-primary-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center shadow-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">搬家管理系统</h1>
            <p className="text-xs text-primary-200">Moving Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-white/10 text-white shadow-inner"
                  : "text-primary-100 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon
              className={cn(
                "w-5 h-5 transition-transform duration-200",
                "group-hover:scale-110"
              )}
            />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-700/50">
        <div className="bg-primary-700/30 rounded-xl p-4">
          <p className="text-sm text-primary-200 mb-1">今日订单</p>
          <p className="text-2xl font-bold text-white">实时管理</p>
        </div>
      </div>
    </aside>
  );
}
