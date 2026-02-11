import { Type } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db } from "../database";
import { orders, userItems } from "../database/schema";
import { dbSchemaTypes } from "../database/type";
import { authenticationMiddleware } from "../middleware/auth";
import { baseResponseSchema } from "../types";

export const ordersRouter = new Elysia({ prefix: "/orders" })
	.use(authenticationMiddleware)
	.guard(
		{
			profileAuth: true,
		},
		(app) =>
			app.post(
				"/",
				async ({ profile, body }) => {
					const { itemId } = body;

					// Check if user has the item
					const [existing] = await db
						.select()
						.from(userItems)
						.where(
							and(
								eq(userItems.profileId, profile.id),
								eq(userItems.itemId, itemId),
							),
						);

					if (!existing || existing.quantity <= 0) {
						throw new Error("Item not found in inventory");
					}

					// atomicity-ish (simplified for this task)
					await db.transaction(async (tx) => {
						if (existing.quantity > 1) {
							await tx
								.update(userItems)
								.set({ quantity: existing.quantity - 1 })
								.where(eq(userItems.id, existing.id));
						} else {
							await tx.delete(userItems).where(eq(userItems.id, existing.id));
						}

						await tx.insert(orders).values({
							itemId: itemId,
							status: "pending",
							profileId: profile.id,
						});
					});

					return { success: true };
				},
				{
					body: t.Object({
						itemId: t.Number(),
					}),
					response: t.Object({ success: t.Boolean() }),
				},
			),
	)
	.guard(
		{
			roleAuth: ["admin"],
		},
		(app) =>
			app
				.get(
					"/",
					async ({ status }) => {
						const data = await db.query.orders.findMany({
							with: {
								profile: true,
								item: true,
							},
						});
						return status(200, {
							success: true,
							data: data,
							timestamp: Date.now(),
						});
					},
					{
						response: {
							200: baseResponseSchema(
								Type.Array(
									Type.Object({
										...dbSchemaTypes.orders,
										profile: Type.Union([
											Type.Optional(Type.Object(dbSchemaTypes.profile)),
											Type.Null(),
											Type.Undefined(),
										]),

										item: Type.Union([
											Type.Optional(Type.Object(dbSchemaTypes.items)),
											Type.Null(),
											Type.Undefined(),
										]),
									}),
								),
							),
						},
					},
				)
				.patch(
					"/:id/status",
					async ({ params: { id }, body, status }) => {
						const [updated] = await db
							.update(orders)
							.set({ status: body.status })
							.where(eq(orders.id, parseInt(id)))
							.returning();
						return status(200, {
							success: true,
							data: updated,
							timestamp: Date.now(),
						});
					},
					{
						params: t.Object({ id: t.String() }),
						body: t.Object({
							status: t.Union([
								t.Literal("pending"),
								t.Literal("shipped"),
								t.Literal("rejected"),
							]),
						}),
						response: {
							200: baseResponseSchema(
								Type.Optional(Type.Object(dbSchemaTypes.orders)),
							),
						},
					},
				),
	);
