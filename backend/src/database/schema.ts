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
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const userItems = pgTable("user_items", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	itemId: serial("item_id")
		.notNull()
		.references(() => items.id, { onDelete: "cascade" }),
	quantity: integer("quantity").default(1).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"shipped",
	"rejected",
]);

export const orders = pgTable("orders", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	itemId: serial("item_id")
		.notNull()
		.references(() => items.id, { onDelete: "cascade" }),
	status: orderStatusEnum("status").default("pending").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export interface AppState {
	createNewAdmin: boolean;
}

export const AppState = pgTable("app_state", {
	id: serial("id").primaryKey(),

	state: jsonb("state").notNull().$type<AppState>().default({
		createNewAdmin: true,
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
	items,
	userItems,
	orders,
	AppState,
} as const;

export const relations = defineRelations(schema, (r) => ({
	user: {
		profile: r.one.profile({
			from: r.user.id,
			to: r.profile.userId,
		}),
		userItems: r.many.userItems({
			from: r.user.id,
			to: r.userItems.userId,
		}),
		orders: r.many.orders({
			from: r.user.id,
			to: r.orders.userId,
		}),
	},
	profile: {
		user: r.one.user({
			from: r.profile.userId,
			to: r.user.id,
		}),
	},
	items: {
		userItems: r.many.userItems({
			from: r.items.id,
			to: r.userItems.itemId,
		}),
		orders: r.many.orders({
			from: r.items.id,
			to: r.orders.itemId,
		}),
	},
	userItems: {
		user: r.one.user({
			from: r.userItems.userId,
			to: r.user.id,
		}),
		item: r.one.items({
			from: r.userItems.itemId,
			to: r.items.id,
		}),
	},
	orders: {
		user: r.one.user({
			from: r.orders.userId,
			to: r.user.id,
		}),
		item: r.one.items({
			from: r.orders.itemId,
			to: r.items.id,
		}),
	},
}));
