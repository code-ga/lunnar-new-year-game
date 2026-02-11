import { Edit2, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BACKEND_URL } from "../constants";
import { useGameStore } from "../store/useGameStore";
import ItemForm from "../components/ItemForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { fetchApi, type SchemaType } from "../lib/api";

const AdminPage: React.FC = () => {
	const { user } = useGameStore();
	const [tab, setTab] = useState<"items" | "orders">("items");
	const [items, setItems] = useState<SchemaType["items"][]>([]);
	const [orders, setOrders] = useState<
		(SchemaType["orders"] & {
			profile: SchemaType["profile"] | null | undefined;
			item: SchemaType["items"] | null | undefined;
		})[]
	>([]);
	const [loading, setLoading] = useState(false);
	const [showCreate, setShowCreate] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [editingItem, setEditingItem] = useState<SchemaType["items"] | null>(
		null,
	);
	const [deletingItem, setDeletingItem] = useState<SchemaType["items"] | null>(
		null,
	);
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
	if (!user?.permission.includes("admin")) {
		navigate("/");
		return;
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
							onClick={() => setTab("orders")}
							className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${tab === "orders" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
						>
							<ShoppingCart size={18} /> Đơn Hàng
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
								className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all h-64 flex flex-col"
							>
								<div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
									<div className="text-4xl mb-4 bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
										{item.image || "🧸"}
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
				) : (
					<div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
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
											className="hover:bg-slate-50/50 transition-colors"
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
														{order.item?.image || "🧸"}
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
													{order.status}
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
		</>
	);
};

export default AdminPage;
