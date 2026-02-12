// import type { SchemaType } from "./lib/api";

export type Rarity = "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS" | "EX"; // DEPRECATED

export interface RarityConfig {
	color: string;
	border: string;
	chance: number;
	value: number;
}

export interface ItemGroup {
	id: number;
	name: string;
	baseChance: number;
	isEx: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface GroupConfig {
	color: string;
	border: string;
	gradient?: string;
}

// export interface PillowTemplate {
//   id: number;
//   name: string;
//   rarity: Rarity;
// }

// export interface InventoryItem extends PillowTemplate {
//   uniqueId: string;
//   obtainedAt: number;
// }

// export type InventoryItem = SchemaType["items"] & SchemaType["userItems"];

export type AppTab = "gacha" | "collection" | "games" | "exchange" | "profile";

export type GameId = "flappy" | "race" | "taixiu" | "baucua" | null;
