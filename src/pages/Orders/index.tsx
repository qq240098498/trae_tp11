import { useState, useMemo } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Trash2,
  X,
  MapPin,
  Phone,
  Calendar,
  Building2,
  Package,
  Wrench,
  Moon,
  FileText,
  User,
  ChevronDown,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrdersStore } from "@/store/orders";
import { formatCurrency } from "@/utils/calculator";
import type { MovingOrder, OrderStatus } from "@/types";
import { statusLabels, statusColors } from "@/types";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, updateStatus, deleteOrder } = useOrdersStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<MovingOrder | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.toAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatus(orderId, status);
    setShowStatusMenu(null);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm("确定要删除这个订单吗？此操作不可恢复。")) {
      deleteOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  const statusOptions: OrderStatus[] = [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-primary-600" />
            记录管理
          </h1>
          <p className="text-gray-500 mt-1">
            共 {orders.length} 条订单记录
          </p>
        </div>
        <button
          onClick={() => navigate("/orders/new")}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          新建订单
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索订单号、客户姓名、电话或地址..."
              className="input-field pl-12"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "all")
              }
              className="input-field w-40"
            >
              <option value="all">全部状态</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">暂无订单记录</p>
            <p className="text-sm mt-1">点击右上角按钮创建第一个订单</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">订单号</th>
                  <th className="pb-3 font-medium">客户信息</th>
                  <th className="pb-3 font-medium">搬家路线</th>
                  <th className="pb-3 font-medium">日期</th>
                  <th className="pb-3 font-medium">金额</th>
                  <th className="pb-3 font-medium">状态</th>
                  <th className="pb-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <td className="py-4 font-mono text-sm text-primary-600 font-medium">
                      {order.id}
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerPhone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm">
                        <p className="text-gray-600 truncate max-w-48">
                          {order.fromAddress || "未填写"}
                        </p>
                        <p className="text-gray-400 text-xs">↓</p>
                        <p className="text-gray-600 truncate max-w-48">
                          {order.toAddress || "未填写"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">
                      {order.moveDate || "未安排"}
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-accent-600">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowStatusMenu(
                              showStatusMenu === order.id ? null : order.id
                            )
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[order.status]}`}
                        >
                          {statusLabels[order.status]}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {showStatusMenu === order.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-32">
                            {statusOptions.map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStatusChange(order.id, status)
                                }
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                  order.status === status
                                    ? "text-primary-600 bg-primary-50"
                                    : "text-gray-700"
                                }`}
                              >
                                {statusLabels[status]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">订单详情</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-primary-600 font-bold">
                    {selectedOrder.id}
                  </p>
                  <p className="text-sm text-gray-400">
                    创建于{" "}
                    {new Date(
                      selectedOrder.createdAt
                    ).toLocaleString("zh-CN")}
                  </p>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}
                >
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">客户信息</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedOrder.customerPhone}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">搬家日期</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {selectedOrder.moveDate || "未安排"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">搬家路线</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm text-gray-500">起始地址</p>
                      <p className="text-gray-900">
                        {selectedOrder.fromAddress || "未填写"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedOrder.floorFrom}层 (
                        {selectedOrder.hasElevatorFrom ? "有电梯" : "无电梯"})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                    <div>
                      <p className="text-sm text-gray-500">目的地址</p>
                      <p className="text-gray-900">
                        {selectedOrder.toAddress || "未填写"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedOrder.floorTo}层 (
                        {selectedOrder.hasElevatorTo ? "有电梯" : "无电梯"})
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-primary-200">
                  <p className="text-sm text-gray-600">
                    距离约 <span className="font-semibold">{selectedOrder.distance}</span>{" "}
                    公里
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <Building2 className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.itemCount}
                  </p>
                  <p className="text-xs text-gray-500">物品件数</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <Wrench className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.needsDisassembly ? "是" : "否"}
                  </p>
                  <p className="text-xs text-gray-500">拆装服务</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <Moon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.isNightService ? "是" : "否"}
                  </p>
                  <p className="text-xs text-gray-500">夜间服务</p>
                </div>
              </div>

              {selectedOrder.hasLargeItems && (
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">大件物品</span>
                  </div>
                  <p className="text-orange-700 font-semibold">
                    共 {selectedOrder.largeItemCount} 件
                  </p>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">备注</span>
                  </div>
                  <p className="text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">费用明细</h3>
                <div className="space-y-2">
                  {selectedOrder.feeBreakdown.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="text-gray-700 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.description}
                        </p>
                      </div>
                      <span
                        className={`font-semibold text-sm ${
                          item.amount > 0 ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {item.amount > 0 ? formatCurrency(item.amount) : "免费"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      订单总价
                    </span>
                    <span className="text-2xl font-bold text-accent-600">
                      {formatCurrency(selectedOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">快捷操作</h3>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    navigate(`/damage-claims?orderId=${selectedOrder.id}`);
                  }}
                  className="w-full btn-accent flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  登记损坏/丢失物品
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
