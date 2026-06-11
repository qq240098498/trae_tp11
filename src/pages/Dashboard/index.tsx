import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  ClipboardList,
  Clock,
  DollarSign,
  Calculator,
  PlusCircle,
  ArrowRight,
  Package,
  Calendar,
} from "lucide-react";
import { useOrdersStore } from "@/store/orders";
import { formatCurrency } from "@/utils/calculator";
import { statusLabels } from "@/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getStats, orders } = useOrdersStore();
  const stats = getStats();

  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      title: "总订单数",
      value: stats.total,
      icon: ClipboardList,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "待处理",
      value: stats.pending,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "已完成",
      value: stats.completed,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "总收入",
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: "from-accent-500 to-accent-600",
      bgColor: "bg-orange-50",
      textColor: "text-accent-600",
    },
  ];

  const quickActions = [
    {
      title: "快速报价",
      description: "立即计算搬家费用",
      icon: Calculator,
      path: "/quote",
      color: "from-primary-500 to-primary-700",
    },
    {
      title: "新建订单",
      description: "登记客户搬家信息",
      icon: PlusCircle,
      path: "/orders/new",
      color: "from-accent-500 to-accent-600",
    },
    {
      title: "记录管理",
      description: "查看和管理所有订单",
      icon: ClipboardList,
      path: "/orders",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-500 mt-1">欢迎使用搬家管理系统</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("zh-CN")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="stat-card animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              快捷操作
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="group p-5 rounded-xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300 text-left relative overflow-hidden bg-gradient-to-br from-white to-gray-50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {action.description}
                  </p>
                  <div className="flex items-center text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    立即前往
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日概览</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">今日订单</p>
                  <p className="text-xl font-bold text-blue-700">
                    {stats.todayCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-accent-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-accent-600">今日营收</p>
                  <p className="text-xl font-bold text-accent-700">
                    {formatCurrency(stats.todayRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近订单</h2>
          <button
            onClick={() => navigate("/orders")}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无订单记录</p>
            <button
              onClick={() => navigate("/orders/new")}
              className="mt-4 btn-accent"
            >
              创建第一个订单
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">订单号</th>
                  <th className="pb-3 font-medium">客户</th>
                  <th className="pb-3 font-medium">搬家日期</th>
                  <th className="pb-3 font-medium">金额</th>
                  <th className="pb-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders`)}
                  >
                    <td className="py-4 font-mono text-sm text-primary-600">
                      {order.id}
                    </td>
                    <td className="py-4 text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="py-4 text-gray-600">{order.moveDate}</td>
                    <td className="py-4 font-semibold text-accent-600">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "confirmed"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "in_progress"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
