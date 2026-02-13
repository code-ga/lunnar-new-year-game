import React, { useState, useEffect, Suspense } from "react";
import {
	Flame,
	Check,
	Copy,
	X,
	Lock,
	Share2,
	MapPin,
	Plus,
} from "lucide-react";
import { useSearchParams, Link } from "react-router";
import { getItemDisplayConfig } from "../constants";
import { useGameStore } from "../store/useGameStore";
import { fetchApi, type SchemaType } from "../lib/api";
import ShippingForm, { type ShippingValues } from "../components/ShippingForm";

const CollectionView: React.FC = () => {
	const {
		inventory,
		templates,
		fetchUserData,
		fetchTemplates,
		user,
		shippingInfos,
	} = useGameStore();
	const [searchParams] = useSearchParams();
	const [subTab, setSubTab] = useState<"inventory" | "catalog">(
		searchParams.get("tab") === "catalog" ? "catalog" : "inventory",
	);
	const [selectedItem, setSelectedItem] = useState<{
		template: SchemaType["items"] & { group?: SchemaType["itemGroups"] | null };
		userItem: SchemaType["userItems"];
	} | null>(null);
	const [burnedCode, setBurnedCode] = useState<{
		full: string;
		masked: string;
	} | null>(null);
	const [shippingItem, setShippingItem] = useState<{
		template: SchemaType["items"];
		userItem: SchemaType["userItems"];
	} | null>(null);
	const [orderLoading, setOrderLoading] = useState(false);
	const [selectedShippingId, setSelectedShippingId] = useState<number | null>(
		null,
	);
	const [showNewAddressForm, setShowNewAddressForm] = useState(false);
	const [newAddressLoading, setNewAddressLoading] = useState(false);

	useEffect(() => {
		if (templates.length === 0) {
			fetchTemplates();
		}
	}, [templates, fetchTemplates]);

	const ownedTemplateIds = new Set(inventory.map((i) => i.id));

	const handleRequestBurn = (item: {
		template: SchemaType["items"];
		userItem: SchemaType["userItems"];
	}) => {
		setSelectedItem(null);
		// Pre-select default shipping info
		setSelectedShippingId(user?.defaultShippingInfoId ?? null);
		setShowNewAddressForm(false);
		setShippingItem(item);
	};

	const handleConfirmOrder = async () => {
		if (!shippingItem) return;
		setOrderLoading(true);
		try {
			const res = await fetchApi("/api/orders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: {
					userItemId: shippingItem.userItem.id,
					shippingInfoId: selectedShippingId ?? undefined,
				},
				credentials: "include",
			});

			if (res.data?.success && res.data.data) {
				const fullCode = `PIL-${shippingItem.template.id}-${shippingItem.template.rarity}-${res.data.data.id}`;
				const maskedCode = `PIL-${shippingItem.template.id}-${shippingItem.template.rarity}-******`;

				setShippingItem(null);
				setBurnedCode({ full: fullCode, masked: maskedCode });
				await fetchUserData();
			} else {
				const err = res.error
					? JSON.stringify(res.error)
					: "Không thể đốt vật phẩm";
				alert(err || "Không thể đốt vật phẩm");
			}
		} catch (e) {
			alert("Lỗi kết nối server");
		} finally {
			setOrderLoading(false);
		}
	};

	const handleCreateAndSelect = async (values: ShippingValues) => {
		setNewAddressLoading(true);
		try {
			const res = await fetchApi("/api/shipping-info", {
				method: "POST",
				body: values,
				credentials: "include",
			});
			if (res.data?.success && res.data.data) {
				await fetchUserData();
				setSelectedShippingId(res.data.data.id);
				setShowNewAddressForm(false);
			}
		} catch (e) {
			alert("Lỗi khi tạo địa chỉ mới");
		} finally {
			setNewAddressLoading(false);
		}
	};

	const handleShare = async (item: {
		template: SchemaType["items"];
		userItem: SchemaType["userItems"];
	}) => {
		if (
			!confirm(
				"Bạn có chắc chắn muốn tạo mã quà tặng? Vật phẩm sẽ biến mất khỏi túi đồ của bạn.",
			)
		)
			return;

		try {
			const res = await fetchApi("/api/exchanges", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: { userItemId: item.userItem.id },
				credentials: "include",
			});

			if (res.data?.success && res.data.data?.code) {
				const fullCode = res.data.data.code;
				const parts = fullCode.split("-");
				const maskedCode = `${parts[0]}-${parts[1]}-${parts[2]}-******`;

				setBurnedCode({ full: fullCode, masked: maskedCode });
				await fetchUserData();
			} else {
				const err = res.error
					? JSON.stringify(res.error)
					: "Không thể tạo mã quà tặng";
				alert(err || "Không thể tạo mã quà tặng");
			}
		} catch (e) {
			alert("Lỗi kết nối server");
		}
	};
	const getItemTemplate = async (itemId: number) => {
		const template = templates.find((t) => t.id === itemId);
		if (template) return template;

		try {
			const res = await fetchApi(`/api/items/:id`, {
				credentials: "include",
				method: "GET",
				params: { id: itemId.toString() },
			});
			if (res.data?.data) {
				return res.data.data as SchemaType["items"] & {
					group?: SchemaType["itemGroups"] | null;
				};
			}
		} catch (e) {
			console.error("Lỗi khi lấy thông tin vật phẩm:", e);
		}
		return {
			id: itemId,
			name: "Unknown Item",
			rarity: "E",
			uniqueId: "UNKNOWN",
			image: "/placeholder.png",
			description: "Không có thông tin",
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			isEx: false,
			adminNote: "",
			quantity: -1,
			groupId: null,
			manualChance: null,
		} as SchemaType["items"] & { group?: SchemaType["itemGroups"] | null };
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		alert("Đã sao chép mã code!");
	};

	return (
		<div className="flex flex-col h-full bg-slate-50">
			{/* Sub-tabs Header */}
			<div className="flex p-4 pb-0 gap-6 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
				<button
					type="button"
					onClick={() => setSubTab("inventory")}
					className={`pb-3 text-sm font-bold border-b-2 transition-colors ${subTab === "inventory" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}
				>
					Túi Đồ ({inventory.length})
				</button>
				<button
					type="button"
					onClick={() => setSubTab("catalog")}
					className={`pb-3 text-sm font-bold border-b-2 transition-colors ${subTab === "catalog" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}
				>
					Danh Mục
				</button>
			</div>

			<div className="flex-1 overflow-y-auto p-4 no-scrollbar">
				{subTab === "inventory" ? (
					inventory.length === 0 ? (
						<div className="flex flex-col items-center justify-center mt-20 text-slate-400 space-y-4">
							<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
								<Lock size={24} />
							</div>
							<p className="font-medium">Túi đồ trống. Hãy đi quay gacha!</p>
						</div>
					) : (
						<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
							<Suspense fallback={<div>Đang tải túi đồ...</div>}>
								{inventory.map(async (item) => {
									const template = await getItemTemplate(item.itemId);
									const config = getItemDisplayConfig(template);
									const isEx = template.isEx || template.group?.isEx;
									return (
										<button
											type="button"
											key={item.uniqueId}
											onClick={() =>
												setSelectedItem({ template, userItem: item })
											}
											className="group cursor-pointer transform transition hover:scale-105 active:scale-95 text-left"
										>
											<div
												className={`relative w-full aspect-[2/3] rounded-xl shadow-md border ${config.border} flex flex-col items-center justify-between p-2 bg-white overflow-hidden`}
											>
												<div
													className={`absolute inset-0 ${config.color} opacity-10 ${isEx ? "ex-gradient opacity-20" : ""}`}
												></div>
												<div className="z-10 w-full text-center text-[10px] font-bold truncate leading-tight mt-1">
													{template.name}
												</div>
												<div
													className={`z-10 w-10 h-10 rounded-full ${config.color} text-white flex items-center justify-center font-black text-xs shadow-sm ${isEx ? "ex-gradient" : ""}`}
												>
													{(template as any).group?.name || template.rarity}
												</div>
												<div className="z-10 text-[9px] text-slate-400 font-mono bg-slate-50 px-1 rounded">
													#{item.uniqueId.slice(-4)}
												</div>
											</div>
										</button>
									);
								})}
							</Suspense>
						</div>
					)
				) : (
					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
						{templates.map((t) => {
							const isOwned = ownedTemplateIds.has(t.id);
							const config = getItemDisplayConfig(t);
							return (
								<div
									key={t.id}
									className={`flex flex-col items-center ${!isOwned ? "opacity-40 grayscale" : ""}`}
								>
									<div
										className={`w-full aspect-square rounded-2xl bg-white border ${isOwned ? config.border : "border-slate-200"} flex items-center justify-center shadow-sm relative overflow-hidden`}
									>
										{isOwned && (
											<div
												className={`absolute inset-0 ${config.color} opacity-10`}
											></div>
										)}
										<span className="text-3xl z-10">
											{isOwned ? t.image || "🧸" : "🔒"}
										</span>
									</div>
									<span className="text-[11px] font-bold text-center mt-2 leading-tight text-slate-700">
										{t.name}
									</span>
									<span
										className={`text-[9px] font-black uppercase tracking-widest ${isOwned ? config.color.replace("bg-", "text-") : "text-slate-400"}`}
									>
										{(t as any).group?.name || t.rarity}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Item Detail Modal */}
			{selectedItem && (
				<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-pop-in">
					<div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center relative overflow-hidden border border-slate-100">
						<button
							type="button"
							onClick={() => setSelectedItem(null)}
							className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"
						>
							<X size={20} />
						</button>

						<h2 className="text-2xl font-black text-indigo-900 mb-1">
							{selectedItem.template.name}
						</h2>
						<div
							className={`inline-block px-3 py-1 rounded-full text-xs font-black text-white ${getItemDisplayConfig(selectedItem.template).color || "bg-slate-500"} mb-6`}
						>
							{selectedItem.template.group?.name ||
								selectedItem.template.rarity}
						</div>

						<div className="p-6 bg-slate-50 rounded-2xl mb-8 border border-slate-200">
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
								Unique Identifier
							</p>
							<p className="font-mono font-bold text-xl select-all tracking-widest text-indigo-600">
								{selectedItem.userItem.uniqueId || "UNKNOWN"}
							</p>
						</div>

						<div className="space-y-3">
							<button
								type="button"
								onClick={() => {
									handleShare(selectedItem);
									setSelectedItem(null);
								}}
								className="w-full py-4 bg-indigo-50 text-indigo-600 font-black rounded-2xl hover:bg-indigo-100 transition flex items-center justify-center gap-3 active:scale-95"
							>
								<Share2 size={20} /> TẠO MÃ QUÀ TẶNG
							</button>

							{(selectedItem.template.isEx ||
								selectedItem.template.group?.isEx) && (
								<button
									type="button"
									onClick={() => handleRequestBurn(selectedItem)}
									className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition flex items-center justify-center gap-3 active:scale-95"
								>
									<Flame size={20} /> NHẬN GỐI THẬT
								</button>
							)}
						</div>
						<p className="mt-4 text-[10px] text-slate-400 px-4 italic">
							Tạo mã quà tặng để chia sẻ cho người khác, hoặc chọn nhận gối thật
							qua đường bưu điện.
						</p>
					</div>
				</div>
			)}

			{/* Shipping Address Selection Modal */}
			{shippingItem && (
				<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-pop-in">
					<div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
						<button
							type="button"
							onClick={() => setShippingItem(null)}
							className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400"
						>
							<X size={20} />
						</button>

						<h2 className="text-xl font-black text-slate-800 mb-1 text-center">
							Chọn địa chỉ giao hàng
						</h2>
						<p className="text-xs text-slate-400 text-center mb-4">
							Gối{" "}
							<span className="font-bold text-indigo-500">
								{shippingItem.template.name}
							</span>
						</p>

						{showNewAddressForm ? (
							<ShippingForm
								onSave={handleCreateAndSelect}
								onCancel={() => setShowNewAddressForm(false)}
								saveLabel="Tạo và chọn"
								loading={newAddressLoading}
							/>
						) : (
							<>
								{shippingInfos.length > 0 ? (
									<div className="space-y-2 mb-4">
										{shippingInfos.map((info) => (
											<button
												key={info.id}
												type="button"
												onClick={() => setSelectedShippingId(info.id)}
												className={`w-full text-left p-3 rounded-xl border transition ${
													selectedShippingId === info.id
														? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
														: "border-slate-200 bg-white hover:border-slate-300"
												}`}
											>
												<div className="flex items-center gap-2">
													<MapPin
														size={14}
														className={
															selectedShippingId === info.id
																? "text-indigo-500"
																: "text-slate-400"
														}
													/>
													<p className="font-bold text-sm text-slate-800">
														{info.fullName}
													</p>
													{user?.defaultShippingInfoId === info.id && (
														<span className="text-[8px] bg-emerald-500 text-white px-1 py-0.5 rounded font-bold">
															MẶC ĐỊNH
														</span>
													)}
												</div>
												<p className="text-xs text-slate-500 mt-0.5 ml-5">
													{info.phone}
												</p>
												<p className="text-xs text-slate-400 ml-5 truncate">
													{info.address}
												</p>
											</button>
										))}
									</div>
								) : (
									<div className="text-center py-6 text-slate-400">
										<MapPin size={24} className="mx-auto mb-2 opacity-50" />
										<p className="text-sm">Chưa có địa chỉ nào</p>
									</div>
								)}

								<button
									type="button"
									onClick={() => setShowNewAddressForm(true)}
									className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-400 font-bold rounded-xl hover:border-indigo-300 hover:text-indigo-400 transition flex items-center justify-center gap-2 text-sm mb-4"
								>
									<Plus size={16} /> Thêm địa chỉ mới
								</button>

								<div className="flex gap-3">
									<button
										type="button"
										onClick={() => setShippingItem(null)}
										className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
									>
										Hủy
									</button>
									<button
										type="button"
										disabled={orderLoading || !selectedShippingId}
										onClick={handleConfirmOrder}
										className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
									>
										{orderLoading ? "Đang xử lý..." : "Xác nhận"}
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}

			{/* Burn Result Modal */}
			{burnedCode && (
				<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-pop-in">
					<div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
						<div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
							<Check size={32} strokeWidth={3} />
						</div>
						<h2 className="text-2xl font-black text-slate-800 mb-2">
							Đổi Thành Công!
						</h2>
						<p className="text-sm text-slate-500 mb-8 px-4">
							Vật phẩm đã được chuyển hóa thành mã quà tặng.
						</p>

						<div className="w-full p-4 bg-slate-800 text-white rounded-2xl mb-6 shadow-inner relative overflow-hidden group">
							<p className="font-mono text-center tracking-widest text-lg font-bold">
								{burnedCode.masked}
							</p>
						</div>

						<button
							type="button"
							onClick={() => copyToClipboard(burnedCode.full)}
							className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 flex items-center justify-center gap-3 active:scale-95 transition-transform"
						>
							<Copy size={20} /> SAO CHÉP MÃ CODE
						</button>

						<button
							type="button"
							onClick={() => setBurnedCode(null)}
							className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600"
						>
							Quay lại túi đồ
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CollectionView;
