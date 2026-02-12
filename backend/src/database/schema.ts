// ALERT: user table only for auth, profile table for user data

import { defineRelations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
export const permissionEnum = pgEnum("permission", ["user", "admin"]);
export const profile = pgTable("profile", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" })
		.unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),

	username: text("username").notNull(),
	permission: permissionEnum("permission").array().default(["user"]).notNull(),
	coins: integer("coins").default(0).notNull(),
	lastCheckIn: timestamp("last_check_in"),
	consecutiveRollsWithoutWin: integer("consecutive_rolls_without_win")
		.default(0)
		.notNull(),

	defaultShippingInfoId: integer("default_shipping_info_id"),

	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const shippingInfo = pgTable("shipping_info", {
	id: serial("id").primaryKey(),
	profileId: text("profile_id")
		.notNull()
		.references(() => profile.id, { onDelete: "cascade" }),
	fullName: text("full_name").notNull(),
	phone: text("phone").notNull(),
	address: text("address").notNull(),
	note: text("note"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const itemGroups = pgTable("item_groups", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	baseChance: integer("base_chance").notNull(),
	isEx: boolean("is_ex").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const items = pgTable("items", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	image: text("image"),
	rarity: text("rarity").default("Common").notNull(),
	groupId: integer("group_id").references(() => itemGroups.id, {
		onDelete: "set null",
	}),
	quantity: integer("quantity").default(-1).notNull(),
	manualChance: integer("manual_chance"),
	adminNote: text("admin_note"),
	isEx: boolean("is_ex").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const userItems = pgTable("user_items", {
	id: serial("id").primaryKey(),
	profileId: text("profile_id")
		.notNull()
		.references(() => profile.id, { onDelete: "cascade" }),
	itemId: serial("item_id")
		.notNull()
		.references(() => items.id, { onDelete: "cascade" }),
	uniqueId: text("unique_id")
		.notNull()
		.unique()
		.$defaultFn(() => crypto.randomUUID()),
	// quantity: integer("quantity").default(1).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"shipped",
	"rejected",
]);

export const orders = pgTable("orders", {
	id: serial("id").primaryKey(),
	profileId: text("profile_id")
		.notNull()
		.references(() => profile.id, { onDelete: "cascade" }),
	itemId: serial("item_id")
		.notNull()
		.references(() => items.id, { onDelete: "cascade" }),
	status: orderStatusEnum("status").default("pending").notNull(),

	shippingInfoId: integer("shipping_info_id").references(() => shippingInfo.id, {
		onDelete: "set null",
	}),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const exchanges = pgTable("exchanges", {
	id: serial("id").primaryKey(),
	profileId: text("profile_id")
		.notNull()
		.references(() => profile.id, { onDelete: "cascade" }),
	itemId: integer("item_id")
		.notNull()
		.references(() => items.id, { onDelete: "cascade" }),
	code: text("code").notNull().unique(),
	isClaimed: boolean("is_claimed").default(false).notNull(),
	claimedById: text("claimed_by").references(() => profile.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	claimedAt: timestamp("claimed_at"),
});

export interface AppState {
	createNewAdmin: boolean;
	pityConfig: {
		enabled: boolean;
		rollsUntilPity: number;
		boostFormula: "inverse";
		winThreshold: number;
	};
}

export const AppState = pgTable("app_state", {
	id: serial("id").primaryKey(),

	state: jsonb("state")
		.notNull()
		.$type<AppState>()
		.default({
			createNewAdmin: true,
			pityConfig: {
				enabled: true,
				rollsUntilPity: 10,
				boostFormula: "inverse" as const,
				winThreshold: 500,
			},
		}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const schema = {
	user,
	session,
	account,
	verification,
	profile,
	shippingInfo,
	itemGroups,
	items,
	userItems,
	orders,
	exchanges,
	AppState,
} as const;

export const relations = defineRelations(schema, (r) => ({
	user: {
		profile: r.one.profile({
			from: r.user.id,
			to: r.profile.userId,
		}),
		session: r.many.session({ from: r.user.id, to: r.session.userId }),
		account: r.many.account({ from: r.user.id, to: r.account.userId }),
		verification: r.many.verification({
			from: r.user.id,
			to: r.verification.identifier,
		}),
	},
	profile: {
		user: r.one.user({
			from: r.profile.userId,
			to: r.user.id,
		}),
		userItems: r.many.userItems({
			from: r.profile.id,
			to: r.userItems.profileId,
		}),
		orders: r.many.orders({
			from: r.profile.id,
			to: r.orders.profileId,
		}),
		exchanges: r.many.exchanges({
			from: r.profile.id,
			to: r.exchanges.profileId,
		}),
		shippingInfos: r.many.shippingInfo({
			from: r.profile.id,
			to: r.shippingInfo.profileId,
		}),
		defaultShippingInfo: r.one.shippingInfo({
			from: r.profile.defaultShippingInfoId,
			to: r.shippingInfo.id,
		}),
	},
	shippingInfo: {
		profile: r.one.profile({
			from: r.shippingInfo.profileId,
			to: r.profile.id,
		}),
	},
	itemGroups: {
		items: r.many.items({
			from: r.itemGroups.id,
			to: r.items.groupId,
		}),
	},
	items: {
		group: r.one.itemGroups({
			from: r.items.groupId,
			to: r.itemGroups.id,
		}),
		userItems: r.many.userItems({
			from: r.items.id,
			to: r.userItems.itemId,
		}),
		orders: r.many.orders({
			from: r.items.id,
			to: r.orders.itemId,
		}),
		exchanges: r.many.exchanges({
			from: r.items.id,
			to: r.exchanges.itemId,
		}),
	},
	userItems: {
		profile: r.one.profile({
			from: r.userItems.profileId,
			to: r.profile.id,
		}),
		item: r.one.items({
			from: r.userItems.itemId,
			to: r.items.id,
		}),
	},
	orders: {
		profile: r.one.profile({
			from: r.orders.profileId,
			to: r.profile.id,
		}),
		item: r.one.items({
			from: r.orders.itemId,
			to: r.items.id,
		}),
		shippingInfo: r.one.shippingInfo({
			from: r.orders.shippingInfoId,
			to: r.shippingInfo.id,
		}),
	},
	exchanges: {
		profile: r.one.profile({
			from: r.exchanges.profileId,
			to: r.profile.id,
		}),
		claimedBy: r.one.profile({
			from: r.exchanges.claimedById,
			to: r.profile.id,
		}),
		item: r.one.items({
			from: r.exchanges.itemId,
			to: r.items.id,
		}),
	},
}));
