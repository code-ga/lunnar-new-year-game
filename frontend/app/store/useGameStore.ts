import { create } from "zustand";
import type { InventoryItem, PillowTemplate } from "../types";
import { BACKEND_URL } from "../constants";

interface UserProfile {
	id: string;
	username: string;
	coins: number;
	lastCheckIn: string | null;
	permission: string[];
}

interface GameState {
	user: UserProfile | null;
	inventory: InventoryItem[];
	templates: PillowTemplate[];
	loading: boolean;
	error: string | null;

	setUser: (user: UserProfile | null) => void;
	setInventory: (items: InventoryItem[]) => void;
	fetchUserData: () => Promise<void>;
	fetchTemplates: () => Promise<void>;
	updateCoins: (amount: number) => void;
	addInventoryItem: (item: InventoryItem) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
	user: null,
	inventory: [],
	templates: [],
	loading: false,
	error: null,

	setUser: (user) => set({ user }),
	setInventory: (inventory) => set({ inventory }),

	fetchUserData: async () => {
		set({ loading: true });
		try {
			const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
				credentials: "include",
			});
			if (response.ok) {
				const data = await response.json();
				set({
					user: data.data,
					inventory: data.data.inventory || [],
				});
			}
		} catch (e) {
			set({ error: "Failed to fetch user data" });
		} finally {
			set({ loading: false });
		}
	},

	updateCoins: (amount) => {
		const { user } = get();
		if (user) {
			set({ user: { ...user, coins: (user.coins || 0) + amount } });
		}
	},

	addInventoryItem: (item) => {
		set((state) => ({ inventory: [item, ...state.inventory] }));
	},

	fetchTemplates: async () => {
		try {
			const response = await fetch(`${BACKEND_URL}/api/items`, {
				credentials: "include",
			});
			if (response.ok) {
				const data = await response.json();
				set({ templates: data });
			}
		} catch (e) {
			console.error("Failed to fetch templates", e);
		}
	},
}));
