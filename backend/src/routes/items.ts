import Elysia, { t } from "elysia";
import { db } from "../database";
import { items } from "../database/schema";
import { eq, and, or, gt } from "drizzle-orm";
import { authenticationMiddleware } from "../middleware/auth";
import { baseResponseSchema } from "../types";
import { Type } from "@sinclair/typebox";
import { dbSchemaTypes } from "../database/type";

export const itemsRouter = new Elysia({ prefix: "/items" })
	.get(
		"/",
		async (ctx) => {
			return ctx.status(200, {
				success: true,
				data: await db.query.items.findMany({
					where: {
						isActive: true,
					},
					with: {
						group: true,
					},
				}),
				timestamp: Date.now(),
			});
		},
		{
			response: {
				200: baseResponseSchema(
					Type.Array(
						Type.Object({
							...dbSchemaTypes.items,
							group: Type.Union([
								Type.Object(dbSchemaTypes.itemGroups),
								Type.Null(),
								Type.Undefined(),
							]),
						}),
					),
				),
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id }, status }) => {
			const item = await db.query.items.findFirst({
				where: {
					id: parseInt(id),
				},
				with: {
					group: true,
				},
			});
			return status(200, {
				success: true,
				data: item,
				timestamp: Date.now(),
			});
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: baseResponseSchema(
					Type.Optional(
						Type.Object({
							...dbSchemaTypes.items,
							group: Type.Union([
								Type.Object(dbSchemaTypes.itemGroups),
								Type.Null(),
								Type.Undefined(),
							]),
						}),
					),
				),
			},
		},
	)
	.get(
		"/by-group/:groupId",
		async ({ params: { groupId }, status }) => {
			const groupItems = await db
				.select()
				.from(items)
				.where(
					and(eq(items.groupId, parseInt(groupId)), eq(items.isActive, true)),
				);
			return status(200, {
				success: true,
				data: groupItems,
				timestamp: Date.now(),
			});
		},
		{
			params: t.Object({ groupId: t.String() }),
			response: {
				200: baseResponseSchema(Type.Array(Type.Object(dbSchemaTypes.items))),
			},
		},
	)
	.use(authenticationMiddleware)
	.guard(
		{
			roleAuth: ["admin"],
		},
		(app) =>
			app
				.post(
					"/",
					async ({ body, status }) => {
						const [newItem] = await db.insert(items).values(body).returning();
						return status(200, {
							success: true,
							data: newItem,
							timestamp: Date.now(),
						});
					},
					{
						body: t.Object({
							name: t.String(),
							description: t.Optional(t.String()),
							image: t.Optional(t.String()),
							rarity: t.Optional(t.String()),
							groupId: t.Optional(t.Number()),
							quantity: t.Optional(t.Number()),
							manualChance: t.Optional(t.Number()),
							adminNote: t.Optional(t.String()),
							isEx: t.Optional(t.Boolean()),
							isActive: t.Optional(t.Boolean()),
						}),
						response: {
							200: baseResponseSchema(
								Type.Optional(Type.Object(dbSchemaTypes.items)),
							),
						},
					},
				)
				.put(
					"/:id",
					async ({ params: { id }, body, status }) => {
						const [updatedItem] = await db
							.update(items)
							.set(body)
							.where(eq(items.id, parseInt(id)))
							.returning();
						return status(200, {
							success: true,
							data: updatedItem,
							timestamp: Date.now(),
						});
					},
					{
						params: t.Object({ id: t.String() }),
						body: t.Object({
							name: t.Optional(t.String()),
							description: t.Optional(t.String()),
							image: t.Optional(t.String()),
							rarity: t.Optional(t.String()),
							groupId: t.Optional(t.Number()),
							quantity: t.Optional(t.Number()),
							manualChance: t.Optional(t.Number()),
							adminNote: t.Optional(t.String()),
							isEx: t.Optional(t.Boolean()),
							isActive: t.Optional(t.Boolean()),
						}),
						response: {
							200: baseResponseSchema(
								Type.Optional(Type.Object(dbSchemaTypes.items)),
							),
						},
					},
				)
				.delete(
					"/:id",
					async ({ params: { id }, status }) => {
						const [deletedItem] = await db
							.delete(items)
							.where(eq(items.id, parseInt(id)))
							.returning();
						return status(200, {
							success: true,
							data: deletedItem,
							timestamp: Date.now(),
						});
					},
					{
						params: t.Object({ id: t.String() }),
						response: {
							200: baseResponseSchema(
								Type.Optional(Type.Object(dbSchemaTypes.items)),
							),
						},
					},
				),
	);
