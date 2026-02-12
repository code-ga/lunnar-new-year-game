import { create } from "zustand";
import { api, type SchemaType } from "../lib/api";

interface GameState {
	user: SchemaType["profile"] | null;
	inventory: SchemaType["userItems"][];
	shippingInfos: SchemaType["shippingInfo"][];
	templates: SchemaType["items"][];
	loading: boolean;
	error: string | null;

	setUser: (user: SchemaType["profile"] | null) => void;
	setInventory: (items: SchemaType["userItems"][]) => void;
	fetchUserData: () => Promise<void>;
	fetchTemplates: () => Promise<void>;
	updateCoins: (amount: number) => void;
	addInventoryItem: (item: SchemaType["userItems"]) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
	user: null,
	inventory: [],
	shippingInfos: [],
	templates: [],
	loading: false,
	error: null,

	setUser: (user) => set({ user }),
	setInventory: (inventory) => set({ inventory }),

	fetchUserData: async () => {
		set({ loading: true });
		try {
			const response = await api.api.profile.me.get();
			if (response.data?.data) {
				set({
					user: response.data?.data.profile,
					inventory: response.data?.data.inventory || [],
					shippingInfos: response.data?.data.shippingInfos || [],
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
			const response = await api.api.items.get();
			if (response.data?.data) {
				set({ templates: response.data.data });
			}
		} catch (e) {
			console.error("Failed to fetch templates", e);
		}
	},
}));
