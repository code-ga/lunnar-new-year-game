import { Rarity, RarityConfig } from "./types";

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
	E: {
		color: "bg-slate-400",
		border: "border-slate-500",
		chance: 0.3,
		value: 10,
	},
	D: {
		color: "bg-stone-500",
		border: "border-stone-600",
		chance: 0.25,
		value: 20,
	},
	C: {
		color: "bg-green-500",
		border: "border-green-600",
		chance: 0.2,
		value: 50,
	},
	B: {
		color: "bg-blue-500",
		border: "border-blue-600",
		chance: 0.12,
		value: 100,
	},
	A: {
		color: "bg-purple-500",
		border: "border-purple-600",
		chance: 0.08,
		value: 250,
	},
	S: {
		color: "bg-yellow-500",
		border: "border-yellow-600",
		chance: 0.03,
		value: 1000,
	},
	SS: {
		color: "bg-orange-500",
		border: "border-orange-600",
		chance: 0.015,
		value: 2500,
	},
	SSS: {
		color: "bg-red-600",
		border: "border-red-700",
		chance: 0.004,
		value: 5000,
	},
	EX: {
		color: "bg-black",
		border: "border-white",
		chance: 0.001,
		value: 10000,
	},
};

// export const PILLOW_TEMPLATES: PillowTemplate[] = [
//   { id: 1, name: "Gối Bông Gòn", rarity: "E" },
//   { id: 2, name: "Gối Len Cũ", rarity: "E" },
//   { id: 3, name: "Gối Kê Cổ", rarity: "D" },
//   { id: 4, name: "Gối Ôm Dài", rarity: "D" },
//   { id: 5, name: "Lông Vũ Mềm", rarity: "C" },
//   { id: 6, name: "Cao Su Non", rarity: "C" },
//   { id: 7, name: "Gel Mát Lạnh", rarity: "B" },
//   { id: 8, name: "Khách Sạn 5 Sao", rarity: "B" },
//   { id: 9, name: "Vỏ Lụa Tơ Tằm", rarity: "A" },
//   { id: 10, name: "Dakimakura", rarity: "A" },
//   { id: 11, name: "Lông Ngỗng", rarity: "S" },
//   { id: 12, name: "Chỉ Vàng Kim", rarity: "SS" },
//   { id: 13, name: "Nhung Hoàng Gia", rarity: "SSS" },
//   { id: 14, name: "Giấc Mơ Vũ Trụ", rarity: "EX" },
// ];

export const GACHA_COST = 100;
export const DAILY_REWARD = 500;
export const BACKEND_URL = "http://localhost:3001";
export const LOGIN_REDIRECT_URL = "http://localhost:3000/";
