import type { Rarity, RarityConfig, GroupConfig } from "./types";

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

export const GROUP_CONFIG: Record<string, GroupConfig> = {
	"Common (E-D)": {
		color: "bg-slate-400",
		border: "border-slate-500",
	},
	"Uncommon (C-B)": {
		color: "bg-green-500",
		border: "border-green-600",
	},
	"Rare (A)": {
		color: "bg-purple-500",
		border: "border-purple-600",
	},
	"Epic (S-SS)": {
		color: "bg-orange-500",
		border: "border-orange-600",
	},
	"Legendary (SSS)": {
		color: "bg-red-600",
		border: "border-red-700",
	},
	"Cosmic (EX)": {
		color: "bg-black",
		border: "border-white",
		gradient: "ex-gradient",
	},
};

// Helper to get display config (supports both new group system and old rarity for backward compat)
export const getItemDisplayConfig = (item: any) => {
	if (item.group?.name) {
		return GROUP_CONFIG[item.group.name] || GROUP_CONFIG["Common (E-D)"];
	}
	// Fallback to old rarity system during migration
	return RARITY_CONFIG[item.rarity as Rarity] || RARITY_CONFIG.E;
};

export const GACHA_COST = 100;
export const DAILY_REWARD = 500;
export const BACKEND_URL = "https://cac-api.lormas.studio";
export const LOGIN_REDIRECT_URL = "https://cac.lormas.studio";