import type { SchemaType } from "./lib/api";

export type Rarity = "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS" | "EX"; // DEPRECATED

export interface RarityConfig {
	color: string;
	border: string;
	chance: number;
	value: number;
}

export type ItemGroup = SchemaType["itemGroups"];

export interface GroupConfig {
	color: string;
	border: string;
	gradient?: string;
}

export type AppTab = "gacha" | "collection" | "games" | "exchange" | "profile";

export type GameId = "flappy" | "race" | "taixiu" | "baucua" | null;
