import {
	Edit2,
	Package,
	Plus,
	ShoppingCart,
	Trash2,
	X,
	MapPin,
	User as UserIcon,
	Layers,
	Settings,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import ItemForm from "../components/ItemForm";
import GroupForm from "../components/GroupForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchApi, type SchemaType } from "../lib/api";
import { useNavigate } from "react-router";
import type { ItemGroup } from "../types";

type OrderWithRelations = SchemaType["orders"] & {
	profile: SchemaType["profile"] | null | undefined;
	item: SchemaType["items"] | null | undefined;
	shippingInfo: SchemaType["shippingInfo"] | null | undefined;
};

const statusLabel: Record<string, string> = {
	pending: "Chờ xử lý",
	shipped: "Đã gửi hàng",
	rejected: "Từ chối",
};

const AdminPage: React.FC = () => {
	const { user } = useGameStore();
	const [tab, setTab] = useState<"items" | "groups" | "orders" | "settings">(
		"items",
	);
	const [items, setItems] = useState<SchemaType["items"][]>([]);
	const [groups, setGroups] = useState<ItemGroup[]>([]);
	const [orders, setOrders] = useState<OrderWithRelations[]>([]);
	const [pityConfig, setPityConfig] = useState({
		enabled: true,
		rollsUntilPity: 10,
		boostFormula: "inverse" as const,
		winThreshold: 500,
	});
	const [settingsLoading, setSettingsLoading] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showCreate, setShowCreate] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [showCreateGroup, setShowCreateGroup] = useState(false);
	const [showEditGroup, setShowEditGroup] = useState(false);
	const [showDeleteGroup, setShowDeleteGroup] = useState(false);
	const [editingItem, setEditingItem] = useState<SchemaType["items"] | null>(
		null,
	);
	const [deletingItem, setDeletingItem] = useState<SchemaType["items"] | null>(
		null,
	);
	const [editingGroup, setEditingGroup] = useState<ItemGroup | null>(null);
	const [deletingGroup, setDeletingGroup] = useState<ItemGroup | null>(null);
	const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(
		null,
	);
	const [statusLoading, setStatusLoading] = useState(false);

	const navigate = useNavigate();

	const fetchData = async () => {
		setLoading(true);
		try {
			if (tab === "items") {
				const res = await fetchApi(`/api/items`, {
					credentials: "include",
					method: "GET",
				});
				if (res.data?.data) setItems(res.data.data);
			} else if (tab === "groups") {
				const res = await fetchApi(`/api/item-groups`, {
					credentials: "include",
					method: "GET",
				});
				if (res.data?.data) setGroups(res.data.data);
			} else if (tab === "settings") {
				const res = await fetchApi(`/api/app-state`, {
					credentials: "include",
					method: "GET",
				});
				if (res.data?.data?.pityConfig) {
					setPityConfig(res.data.data.pityConfig);
				}
			} else {
				const res = await fetchApi(`/api/orders`, {
					credentials: "include",
					method: "GET",
				});
				if (res.data?.data) setOrders(res.data.data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const handleSavePityConfig = async () => {
		setSettingsLoading(true);
		try {
			const res = await fetchApi(`/api/app-state/pity-config`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: pityConfig,
			});
			if (res.data?.success) {
				alert("Cài đặt pity đã được lưu!");
			}
		} catch (e) {
			console.error(e);
			alert("Lỗi khi lưu cài đặt");
		} finally {
			setSettingsLoading(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchData();
	}, [tab]);

	const handleDelete = async () => {
		if (!deletingItem) return;
		try {
			const res = await fetchApi(`/api/items/:id`, {
				method: "DELETE",
				credentials: "include",
				params: { id: deletingItem.id.toString() },
			});
			if (res.data?.success) {
				setShowDelete(false);
				setDeletingItem(null);
				fetchData();
			}
		} catch (e) {
			console.error(e);
		}
	};

	const handleDeleteGroup = async () => {
		if (!deletingGroup) return;
		try {
			const res = await fetchApi(`/api/item-groups/:id`, {
				method: "DELETE",
				credentials: "include",
				params: { id: deletingGroup.id.toString() },
			});
			if (res.data?.success) {
				setShowDeleteGroup(false);
				setDeletingGroup(null);
				fetchData();
			}
		} catch (e) {
			console.error(e);
		}
	};

	const handleStatusChange = async (
		orderId: number,
		newStatus: "shipped" | "rejected",
	) => {
		setStatusLoading(true);
		try {
			const res = await fetchApi(`/api/orders/:id/status`, {
				method: "PATCH",
				credentials: "include",
				params: { id: orderId.toString() },
				body: { status: newStatus },
			});
			if (res.data?.success) {
				await fetchData();
				// Update selectedOrder with the new data
				setSelectedOrder((prev) =>
					prev ? { ...prev, status: newStatus } : null,
				);
			}
		} catch (e) {
			console.error(e);
			alert("Lỗi khi cập nhật trạng thái đơn hàng");
		} finally {
			setStatusLoading(false);
		}
	};

	if (user && !user.permission.includes("admin")) {
		navigate("/");
		return <>Bạn không có quyền truy cập trang này.</>;
	}
	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
				<header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<h1 className="text-3xl font-black text-slate-800 tracking-tight">
							Admin Dashboard
						</h1>
						<p className="text-slate-500 font-medium">
							Quản lý vật phẩm và đơn hàng gối ôm.
						</p>
					</div>
					<div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
						<button
							type="button"
							onClick={() => setTab("items")}
							className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${tab === "items" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							<Package size={18} /> Vật Phẩm
						</button>
						<button
							type="button"
							onClick={() => setTab("groups")}
							className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${tab === "groups" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							<Layers size={18} /> Nhóm
						</button>
						<button
							type="button"
							onClick={() => setTab("orders")}
							className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${tab === "orders" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							<ShoppingCart size={18} /> Đơn Hàng
						</button>
						<button
							type="button"
							onClick={() => setTab("settings")}
							className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${tab === "settings" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							<Settings size={18} /> Cài Đặt
						</button>
					</div>
				</header>

				{tab === "items" ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<button
							type="button"
							onClick={() => setShowCreate(true)}
							className="h-64 border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/30 transition-all group"
						>
							<div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
								<Plus size={32} />
							</div>
							<span className="font-black text-lg">Thêm Vật Phẩm Mới</span>
						</button>

						{items.map((item) => (
							<div
								key={item.id}
								className="bg-white rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all h-64 flex flex-col"
							>
								<div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
									<div className="text-4xl mb-4 bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
										{item.image?.startsWith("http") ? (
											<img
												src={item.image}
												alt={item.name}
												className="w-full h-full object-cover rounded-2xl"
											/>
										) : (
											item.image || "🧸"
										)}
									</div>
									<h3 className="font-black text-xl text-slate-800">
										{item.name}
									</h3>
									<div className="text-xs font-bold text-indigo-500 uppercase mt-2 tracking-widest">
										{item.rarity} Rank
									</div>
								</div>
								<div className="bg-slate-50 p-4 flex gap-2 border-t border-slate-100">
									<button
										type="button"
										onClick={() => {
											setEditingItem(item);
											setShowEdit(true);
										}}
										className="flex-1 bg-white border border-slate-200 py-2 rounded-xl text-slate-500 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
									>
										<Edit2 size={14} /> Sửa
									</button>
									<button
										type="button"
										onClick={() => {
											setDeletingItem(item);
											setShowDelete(true);
										}}
										className="p-2 bg-white border border-slate-200 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						))}
					</div>
				) : tab === "groups" ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<button
							type="button"
							onClick={() => setShowCreateGroup(true)}
							className="h-48 border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-purple-300 hover:text-purple-400 hover:bg-purple-50/30 transition-all group"
						>
							<div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
								<Plus size={32} />
							</div>
							<span className="font-black text-lg">Thêm Nhóm Mới</span>
						</button>

						{groups.map((group) => {
							const totalChance = groups.reduce(
								(sum, g) => sum + g.baseChance,
								0,
							);
							const percentage =
								(group.baseChance / 100 / (totalChance / 100)) * 100;

							return (
								<div
									key={group.id}
									className="bg-white rounded-3xl shadow-sm border border-slate-100 group hover:shadow-xl transition-all h-48 flex flex-col"
								>
									<div className="flex-1 p-6 flex flex-col justify-center items-center text-center gap-2">
										<h3 className="font-black text-xl text-slate-800">
											{group.name}
										</h3>
										<div className="text-sm text-slate-600">
											Base: {(group.baseChance / 100).toFixed(2)}%
										</div>
										<div className="text-xs text-purple-500 font-bold">
											Current: ~{percentage.toFixed(2)}% of total
										</div>
										{group.isEx && (
											<div className="text-xs bg-black text-white px-2 py-1 rounded-full font-bold">
												EX GROUP
											</div>
										)}
									</div>
									<div className="bg-slate-50 p-4 flex gap-2 border-t border-slate-100">
										<button
											type="button"
											onClick={() => {
												setEditingGroup(group);
												setShowEditGroup(true);
											}}
											className="flex-1 bg-white border border-slate-200 py-2 rounded-xl text-slate-500 font-bold hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
										>
											<Edit2 size={14} /> Sửa
										</button>
										<button
											type="button"
											onClick={() => {
												setDeletingGroup(group);
												setShowDeleteGroup(true);
											}}
											className="p-2 bg-white border border-slate-200 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				) : tab === "settings" ? (
					<div className="max-w-2xl mx-auto">
						<div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
							<h2 className="text-2xl font-black text-slate-800 mb-6">
								Cài Đặt Hệ Thống Pity
							</h2>

							<div className="space-y-6">
								<label className="flex items-center gap-3">
									<input
										type="checkbox"
										checked={pityConfig.enabled}
										onChange={(e) =>
											setPityConfig({
												...pityConfig,
												enabled: e.target.checked,
											})
										}
										className="w-5 h-5"
									/>
									<span className="font-bold text-slate-700">
										Kích hoạt hệ thống pity
									</span>
								</label>

								<div>
									<label
										htmlFor="rollsUntilPity"
										className="block font-bold text-slate-700 mb-2"
									>
										Số lần roll cần thiết để kích hoạt pity
									</label>
									<input
										id="rollsUntilPity"
										type="number"
										min="1"
										value={pityConfig.rollsUntilPity}
										onChange={(e) =>
											setPityConfig({
												...pityConfig,
												rollsUntilPity: Number(e.target.value),
											})
										}
										className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										placeholder="10"
									/>
									<p className="text-sm text-slate-500 mt-1">
										Sau {pityConfig.rollsUntilPity} lần roll không trúng rare,
										tỉ lệ sẽ tăng 0.1%
									</p>
								</div>

								<div>
									<label
										htmlFor="boostFormula"
										className="block font-bold text-slate-700 mb-2"
									>
										Công thức tăng tỉ lệ
									</label>
									<select
										id="boostFormula"
										value={pityConfig.boostFormula}
										onChange={(e) =>
											setPityConfig({
												...pityConfig,
												boostFormula: e.target.value as "inverse",
											})
										}
										className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									>
										<option value="inverse">
											Inverse (nhóm ít % tăng nhiều hơn)
										</option>
									</select>
									<p className="text-sm text-slate-500 mt-1">
										Công thức inverse: nhóm có tỉ lệ thấp sẽ được boost nhiều
										hơn nhóm có tỉ lệ cao
									</p>
								</div>

								<div>
									<label
										htmlFor="winThreshold"
										className="block font-bold text-slate-700 mb-2"
									>
										Ngưỡng "win" (basis points)
									</label>
									<input
										id="winThreshold"
										type="number"
										min="0"
										max="10000"
										step="10"
										value={pityConfig.winThreshold}
										onChange={(e) =>
											setPityConfig({
												...pityConfig,
												winThreshold: Number(e.target.value),
											})
										}
										className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										placeholder="500"
									/>
									<p className="text-sm text-slate-500 mt-1">
										Nhóm có base chance ≤{" "}
										{(pityConfig.winThreshold / 100).toFixed(2)}% sẽ reset pity
										counter (500 = 5%)
									</p>
								</div>

								<button
									type="button"
									onClick={handleSavePityConfig}
									disabled={settingsLoading}
									className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
								>
									{settingsLoading ? "Đang lưu..." : "Lưu Cài Đặt"}
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-3xl shadow-sm border border-slate-100">
						<table className="w-full text-left">
							<thead className="bg-slate-50 border-b border-slate-100">
								<tr>
									<th className="px-6 py-4 font-black text-slate-600 uppercase text-xs tracking-widest">
										Khách Hàng
									</th>
									<th className="px-6 py-4 font-black text-slate-600 uppercase text-xs tracking-widest">
										Vật Phẩm
									</th>
									<th className="px-6 py-4 font-black text-slate-600 uppercase text-xs tracking-widest">
										Ngày Đặt
									</th>
									<th className="px-6 py-4 font-black text-slate-600 uppercase text-xs tracking-widest text-right">
										Trạng Thái
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{orders.length === 0 ? (
									<tr>
										<td
											colSpan={4}
											className="px-6 py-12 text-center text-slate-400 font-medium"
										>
											Chưa có đơn hàng nào được tạo.
										</td>
									</tr>
								) : (
									orders.map((order) => (
										<tr
											key={order.id}
											onClick={() => setSelectedOrder(order)}
											className="hover:bg-slate-50/50 transition-colors cursor-pointer"
										>
											<td className="px-6 py-4">
												<div className="font-bold text-slate-800">
													{order.profile?.username || "User"}
												</div>
												<div className="text-[10px] text-slate-400 font-mono">
													ID: {order.profile?.id}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="text-2xl">
														{order.item?.image?.startsWith("http") ? (
															<img
																src={order.item?.image}
																alt={order.item?.name}
																className="w-12 h-12 rounded-lg object-cover"
															/>
														) : (
															order.item?.image || "🧸"
														)}
													</div>
													<div className="font-bold text-slate-700">
														{order.item?.name}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-slate-500 text-sm font-medium">
												{new Date(order.createdAt).toLocaleDateString("vi-VN")}
											</td>
											<td className="px-6 py-4 text-right">
												<span
													className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
														order.status === "pending"
															? "bg-yellow-100 text-yellow-700"
															: order.status === "shipped"
																? "bg-green-100 text-green-700"
																: "bg-red-100 text-red-700"
													}`}
												>
													{statusLabel[order.status] || order.status}
												</span>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Order Detail Modal */}
			{selectedOrder && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/40 backdrop-blur-sm"
						onClick={() => setSelectedOrder(null)}
					/>
					<div className="bg-white rounded-3xl shadow-2xl p-6 z-10 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
						<button
							type="button"
							onClick={() => setSelectedOrder(null)}
							className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"
						>
							<X size={20} />
						</button>

						<h3 className="font-black text-xl text-slate-800 mb-6">
							Chi tiết đơn hàng #{selectedOrder.id}
						</h3>

						{/* Order Info */}
						<div className="space-y-4">
							{/* Customer */}
							<div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
								<div className="flex items-center gap-2 mb-2">
									<UserIcon size={16} className="text-slate-400" />
									<p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
										Khách hàng
									</p>
								</div>
								<p className="font-bold text-slate-800">
									{selectedOrder.profile?.username || "User"}
								</p>
								<p className="text-xs text-slate-400 font-mono">
									Profile ID: {selectedOrder.profile?.id || "N/A"}
								</p>
							</div>

							{/* Item */}
							<div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
								<p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-2">
									Vật phẩm
								</p>
								<div className="flex items-center gap-3">
									<div className="text-3xl bg-white w-14 h-14 rounded-xl flex items-center justify-center border border-slate-200">
										{selectedOrder.item?.image?.startsWith("http") ? (
											<img
												src={selectedOrder.item?.image}
												alt={selectedOrder.item?.name}
												className="w-full h-full object-cover rounded-xl"
											/>
										) : (
											selectedOrder.item?.image || "🧸"
										)}
									</div>
									<div>
										<p className="font-bold text-slate-800">
											{selectedOrder.item?.name || "Unknown"}
										</p>
										<p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
											{selectedOrder.item?.rarity} Rank
										</p>
									</div>
								</div>
							</div>

							{/* Shipping Info */}
							<div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
								<div className="flex items-center gap-2 mb-2">
									<MapPin size={16} className="text-emerald-500" />
									<p className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">
										Thông tin giao hàng
									</p>
								</div>
								{selectedOrder.shippingInfo ? (
									<div className="space-y-1.5 text-sm">
										<p className="font-bold text-slate-800">
											{selectedOrder.shippingInfo.fullName}
										</p>
										<p className="text-slate-600">
											{selectedOrder.shippingInfo.phone}
										</p>
										<p className="text-slate-500">
											{selectedOrder.shippingInfo.address}
										</p>
										{selectedOrder.shippingInfo.note && (
											<p className="text-slate-400 italic text-xs">
												{selectedOrder.shippingInfo.note}
											</p>
										)}
									</div>
								) : (
									<p className="text-sm text-slate-400 italic">
										Chưa có thông tin giao hàng
									</p>
								)}
							</div>

							{/* Date & Status */}
							<div className="flex gap-4">
								<div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
									<p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
										Ngày tạo
									</p>
									<p className="text-sm font-bold text-slate-700">
										{new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
									</p>
								</div>
								<div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
									<p className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
										Trạng thái
									</p>
									<span
										className={`inline-block px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
											selectedOrder.status === "pending"
												? "bg-yellow-100 text-yellow-700"
												: selectedOrder.status === "shipped"
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
										}`}
									>
										{statusLabel[selectedOrder.status] || selectedOrder.status}
									</span>
								</div>
							</div>

							{/* Action Buttons */}
							{selectedOrder.status === "pending" && (
								<div className="flex gap-3 pt-2">
									<button
										type="button"
										disabled={statusLoading}
										onClick={() =>
											handleStatusChange(selectedOrder.id, "shipped")
										}
										className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50"
									>
										{statusLoading ? "Đang xử lý..." : "Đã gửi hàng"}
									</button>
									<button
										type="button"
										disabled={statusLoading}
										onClick={() =>
											handleStatusChange(selectedOrder.id, "rejected")
										}
										className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50"
									>
										{statusLoading ? "Đang xử lý..." : "Từ chối"}
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{showCreate && (
				<ItemForm
					onClose={() => setShowCreate(false)}
					onSaved={() => fetchData()}
				/>
			)}
			{showEdit && editingItem && (
				<ItemForm
					item={editingItem}
					onClose={() => {
						setShowEdit(false);
						setEditingItem(null);
					}}
					onSaved={() => fetchData()}
				/>
			)}
			{showDelete && deletingItem && (
				<ConfirmDialog
					message={`Xóa vật phẩm "${deletingItem.name}"? Hành động không thể hoàn tác.`}
					onConfirm={handleDelete}
					onClose={() => setShowDelete(false)}
				/>
			)}

			{showCreateGroup && (
				<GroupForm
					onClose={() => setShowCreateGroup(false)}
					onSaved={() => fetchData()}
				/>
			)}
			{showEditGroup && editingGroup && (
				<GroupForm
					group={editingGroup}
					onClose={() => {
						setShowEditGroup(false);
						setEditingGroup(null);
					}}
					onSaved={() => fetchData()}
				/>
			)}
			{showDeleteGroup && deletingGroup && (
				<ConfirmDialog
					message={`Xóa nhóm "${deletingGroup.name}"? Tất cả vật phẩm trong nhóm sẽ không có nhóm. Hành động không thể hoàn tác.`}
					onConfirm={handleDeleteGroup}
					onClose={() => setShowDeleteGroup(false)}
				/>
			)}
		</>
	);
};

export default AdminPage;
