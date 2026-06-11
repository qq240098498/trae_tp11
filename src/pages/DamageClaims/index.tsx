import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Trash2,
  X,
  PlusCircle,
  Package,
  User,
  Phone,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronDown,
  MinusCircle,
  DollarSign,
  Edit3,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDamageClaimsStore } from "@/store/damageClaims";
import { useOrdersStore } from "@/store/orders";
import { formatCurrency } from "@/utils/calculator";
import type {
  DamageClaim,
  DamageStatus,
  DamageType,
  DamageItem,
} from "@/types";
import {
  damageTypeLabels,
  damageStatusLabels,
  damageStatusColors,
  damageDegreeLabels,
} from "@/types";

type ViewMode = "list" | "create" | "detail";

export default function DamageClaimsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { claims, addClaim, updateStatus, deleteClaim } = useDamageClaimsStore();
  const { orders } = useOrdersStore();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedClaim, setSelectedClaim] = useState<DamageClaim | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DamageStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<DamageType | "all">("all");
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    orderId: "",
    customerName: "",
    customerPhone: "",
    type: "damage" as DamageType,
    items: [] as DamageItem[],
    incidentDate: new Date().toISOString().split("T")[0],
    incidentDescription: "",
    reportedBy: "",
    compensationAmount: 0,
  });

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    estimatedValue: 0,
    damageDegree: "minor" as DamageItem["damageDegree"],
    description: "",
  });

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.customerPhone.includes(searchTerm) ||
        claim.orderId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
      const matchesType = typeFilter === "all" || claim.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [claims, searchTerm, statusFilter, typeFilter]);

  const totalEstimatedValue = useMemo(() => {
    return formData.items.reduce(
      (sum, item) => sum + item.estimatedValue * item.quantity,
      0
    );
  }, [formData.items]);

  const statusOptions: DamageStatus[] = [
    "pending",
    "investigating",
    "approved",
    "rejected",
    "compensated",
  ];

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setFormData((prev) => {
          if (prev.orderId === orderId) return prev;
          return {
            ...prev,
            orderId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
          };
        });
        setViewMode("create");
      }
    }
  }, [searchParams.get("orderId"), orders.length]);

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setFormData((prev) => ({
        ...prev,
        orderId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      }));
    }
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      alert("请输入物品名称");
      return;
    }
    const item: DamageItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...newItem,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({
      name: "",
      quantity: 1,
      estimatedValue: 0,
      damageDegree: "minor",
      description: "",
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleSubmit = () => {
    if (!formData.customerName || !formData.customerPhone) {
      alert("请填写客户姓名和电话");
      return;
    }
    if (formData.items.length === 0) {
      alert("请至少添加一个损坏/丢失物品");
      return;
    }

    const claimData: Omit<DamageClaim, "id" | "createdAt" | "updatedAt"> = {
      orderId: formData.orderId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      type: formData.type,
      items: formData.items,
      totalEstimatedValue,
      compensationAmount: formData.compensationAmount || totalEstimatedValue,
      status: "pending",
      reportedBy: formData.reportedBy || "系统管理员",
      reportDate: new Date().toISOString().split("T")[0],
      incidentDate: formData.incidentDate,
      incidentDescription: formData.incidentDescription,
    };

    addClaim(claimData);
    setViewMode("list");
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      orderId: "",
      customerName: "",
      customerPhone: "",
      type: "damage",
      items: [],
      incidentDate: new Date().toISOString().split("T")[0],
      incidentDescription: "",
      reportedBy: "",
      compensationAmount: 0,
    });
  };

  const handleStatusChange = (claimId: string, status: DamageStatus) => {
    updateStatus(claimId, status);
    setShowStatusMenu(null);
    if (selectedClaim?.id === claimId) {
      setSelectedClaim((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleDelete = (claimId: string) => {
    if (window.confirm("确定要删除这条损坏登记记录吗？此操作不可恢复。")) {
      deleteClaim(claimId);
      if (selectedClaim?.id === claimId) {
        setSelectedClaim(null);
        setViewMode("list");
      }
    }
  };

  const handleViewDetail = (claim: DamageClaim) => {
    setSelectedClaim(claim);
    setViewMode("detail");
  };

  const stats = useMemo(() => {
    const compensatedClaims = claims.filter((claim) => claim.status === "compensated");
    return {
      total: claims.length,
      pending: claims.filter((claim) => claim.status === "pending").length,
      investigating: claims.filter((claim) => claim.status === "investigating").length,
      approved: claims.filter((claim) => claim.status === "approved").length,
      totalCompensation: compensatedClaims.reduce(
        (sum, claim) => sum + claim.compensationAmount,
        0
      ),
    };
  }, [claims]);

  return (
    <div className="space-y-6 animate-fade-in">
      {viewMode === "list" && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-red-500" />
                损坏丢失登记
              </h1>
              <p className="text-gray-500 mt-1">
                共 {claims.length} 条记录，待处理 {stats.pending} 条
              </p>
            </div>
            <button
              onClick={() => setViewMode("create")}
              className="btn-primary flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              新增登记
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">总记录数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-xl">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">待处理</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">调查中</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">累计赔偿</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(stats.totalCompensation)}
                  </p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索登记号、客户姓名、电话或订单号..."
                  className="input-field pl-12"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as DamageType | "all")}
                  className="input-field w-36"
                >
                  <option value="all">全部类型</option>
                  <option value="damage">物品损坏</option>
                  <option value="loss">物品丢失</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DamageStatus | "all")}
                  className="input-field w-36"
                >
                  <option value="all">全部状态</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {damageStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredClaims.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">暂无损坏丢失记录</p>
                <p className="text-sm mt-1">点击右上角按钮新增第一条登记</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">登记号</th>
                      <th className="pb-3 font-medium">客户信息</th>
                      <th className="pb-3 font-medium">类型</th>
                      <th className="pb-3 font-medium">物品数量</th>
                      <th className="pb-3 font-medium">预估价值</th>
                      <th className="pb-3 font-medium">赔偿金额</th>
                      <th className="pb-3 font-medium">状态</th>
                      <th className="pb-3 font-medium text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredClaims.map((claim, index) => (
                      <tr
                        key={claim.id}
                        className="hover:bg-gray-50 transition-colors animate-slide-up"
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <td className="py-4 font-mono text-sm text-primary-600 font-medium">
                          {claim.id}
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {claim.customerName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {claim.customerPhone}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              claim.type === "damage"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {damageTypeLabels[claim.type]}
                          </span>
                        </td>
                        <td className="py-4 text-gray-600">
                          {claim.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                        </td>
                        <td className="py-4 text-gray-600">
                          {formatCurrency(claim.totalEstimatedValue)}
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-accent-600">
                            {formatCurrency(claim.compensationAmount)}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowStatusMenu(
                                  showStatusMenu === claim.id ? null : claim.id
                                )
                              }
                              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${damageStatusColors[claim.status]}`}
                            >
                              {damageStatusLabels[claim.status]}
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {showStatusMenu === claim.id && (
                              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-32">
                                {statusOptions.map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(claim.id, status)}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                      claim.status === status
                                        ? "text-primary-600 bg-primary-50"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {damageStatusLabels[status]}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(claim)}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(claim.id)}
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
        </>
      )}

      {viewMode === "create" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <PlusCircle className="w-7 h-7 text-primary-600" />
                新增损坏丢失登记
              </h1>
              <p className="text-gray-500 mt-1">登记搬家过程中的物品损坏或丢失情况</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  基本信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      关联订单
                    </label>
                    <select
                      value={formData.orderId}
                      onChange={(e) => handleOrderSelect(e.target.value)}
                      className="input-field"
                    >
                      <option value="">选择关联订单（可选）</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.id} - {order.customerName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      登记类型 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value as DamageType,
                        }))
                      }
                      className="input-field"
                    >
                      <option value="damage">物品损坏</option>
                      <option value="loss">物品丢失</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      客户姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="请输入客户姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      联系电话 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="请输入联系电话"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      事发日期
                    </label>
                    <input
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          incidentDate: e.target.value,
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      登记人
                    </label>
                    <input
                      type="text"
                      value={formData.reportedBy}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reportedBy: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="请输入登记人姓名"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" />
                  {formData.type === "damage" ? "损坏物品" : "丢失物品"}
                </h2>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">添加物品</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        物品名称
                      </label>
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="input-field text-sm"
                        placeholder="物品名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">数量</label>
                      <input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem((prev) => ({
                            ...prev,
                            quantity: Number(e.target.value),
                          }))
                        }
                        className="input-field text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        预估价值(元)
                      </label>
                      <input
                        type="number"
                        value={newItem.estimatedValue}
                        onChange={(e) =>
                          setNewItem((prev) => ({
                            ...prev,
                            estimatedValue: Number(e.target.value),
                          }))
                        }
                        className="input-field text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        损坏程度
                      </label>
                      <select
                        value={newItem.damageDegree}
                        onChange={(e) =>
                          setNewItem((prev) => ({
                            ...prev,
                            damageDegree: e.target
                              .value as DamageItem["damageDegree"],
                          }))
                        }
                        className="input-field text-sm"
                      >
                        <option value="minor">轻微损坏</option>
                        <option value="moderate">中度损坏</option>
                        <option value="severe">严重损坏</option>
                        <option value="total_loss">完全损坏/丢失</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm text-gray-500 mb-1">
                      损坏/丢失描述
                    </label>
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="input-field text-sm"
                      placeholder="描述具体情况"
                    />
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="mt-3 btn-secondary flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    添加物品
                  </button>
                </div>

                {formData.items.length > 0 ? (
                  <div className="space-y-3">
                    {formData.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              数量: {item.quantity} |{" "}
                              {damageDegreeLabels[item.damageDegree]}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-accent-600">
                            {formatCurrency(item.estimatedValue * item.quantity)}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无物品，点击上方添加</p>
                  </div>
                )}
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  事件描述
                </h2>
                <textarea
                  value={formData.incidentDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      incidentDescription: e.target.value,
                    }))
                  }
                  className="input-field min-h-32 resize-none"
                  placeholder="请详细描述事件经过、原因等信息..."
                  rows={5}
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode("list")}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回列表
                </button>
                <button onClick={handleSubmit} className="btn-accent flex-1 py-3 text-lg">
                  提交登记
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent-500" />
                  费用估算
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">物品件数</span>
                    <span className="font-semibold text-gray-900">
                      {formData.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      件
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">预估总价值</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalEstimatedValue)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">
                      拟定赔偿金额
                    </label>
                    <input
                      type="number"
                      value={formData.compensationAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          compensationAmount: Number(e.target.value),
                        }))
                      }
                      className="input-field text-lg font-bold text-center"
                      placeholder={totalEstimatedValue.toString()}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      默认为预估总价值
                    </p>
                  </div>
                </div>
                <div className="mt-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">赔偿金额</span>
                    <span className="text-2xl font-bold text-accent-600">
                      {formatCurrency(
                        formData.compensationAmount || totalEstimatedValue
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "detail" && selectedClaim && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-7 h-7 text-primary-600" />
                登记详情
              </h1>
              <p className="text-gray-500 mt-1">
                登记号: {selectedClaim.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" />
                    基本信息
                  </h2>
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${damageStatusColors[selectedClaim.status]}`}
                  >
                    {damageStatusLabels[selectedClaim.status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">登记类型</p>
                    <p className="font-semibold text-gray-900">
                      {damageTypeLabels[selectedClaim.type]}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">关联订单</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.orderId || "无"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">客户姓名</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.customerName}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">联系电话</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.customerPhone}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">事发日期</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.incidentDate}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">登记人</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.reportedBy}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-500" />
                  {selectedClaim.type === "damage" ? "损坏物品清单" : "丢失物品清单"}
                </h2>
                <div className="space-y-3">
                  {selectedClaim.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 rounded-xl"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">
                                数量: {item.quantity}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  item.damageDegree === "minor"
                                    ? "bg-green-100 text-green-700"
                                    : item.damageDegree === "moderate"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : item.damageDegree === "severe"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {damageDegreeLabels[item.damageDegree]}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">单价</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.estimatedValue)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            小计: {formatCurrency(item.estimatedValue * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedClaim.incidentDescription && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" />
                    事件描述
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedClaim.incidentDescription}
                  </p>
                </div>
              )}

              {selectedClaim.handlingNotes && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary-500" />
                    处理备注
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedClaim.handlingNotes}
                  </p>
                  {selectedClaim.handler && (
                    <p className="text-sm text-gray-500 mt-3">
                      处理人: {selectedClaim.handler}
                      {selectedClaim.handleDate &&
                        ` · ${new Date(selectedClaim.handleDate).toLocaleDateString(
                          "zh-CN"
                        )}`}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent-500" />
                  赔偿信息
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">物品总数</span>
                    <span className="font-semibold text-gray-900">
                      {selectedClaim.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      件
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">预估总价值</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(selectedClaim.totalEstimatedValue)}
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">赔偿金额</span>
                      <span className="text-2xl font-bold text-accent-600">
                        {formatCurrency(selectedClaim.compensationAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">状态流转</h2>
                <div className="space-y-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedClaim.id, status)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedClaim.status === status
                          ? "bg-primary-100 border-2 border-primary-500"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {status === "pending" && (
                          <Clock
                            className={`w-5 h-5 ${
                              selectedClaim.status === status
                                ? "text-primary-600"
                                : "text-gray-400"
                            }`}
                          />
                        )}
                        {status === "investigating" && (
                          <Search
                            className={`w-5 h-5 ${
                              selectedClaim.status === status
                                ? "text-primary-600"
                                : "text-gray-400"
                            }`}
                          />
                        )}
                        {status === "approved" && (
                          <CheckCircle
                            className={`w-5 h-5 ${
                              selectedClaim.status === status
                                ? "text-primary-600"
                                : "text-gray-400"
                            }`}
                          />
                        )}
                        {status === "rejected" && (
                          <XCircle
                            className={`w-5 h-5 ${
                              selectedClaim.status === status
                                ? "text-primary-600"
                                : "text-gray-400"
                            }`}
                          />
                        )}
                        {status === "compensated" && (
                          <DollarSign
                            className={`w-5 h-5 ${
                              selectedClaim.status === status
                                ? "text-primary-600"
                                : "text-gray-400"
                            }`}
                          />
                        )}
                        <span
                          className={`font-medium ${
                            selectedClaim.status === status
                              ? "text-primary-700"
                              : "text-gray-700"
                          }`}
                        >
                          {damageStatusLabels[status]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">时间信息</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">创建时间</span>
                    <span className="text-gray-700">
                      {new Date(selectedClaim.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">更新时间</span>
                    <span className="text-gray-700">
                      {new Date(selectedClaim.updatedAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
