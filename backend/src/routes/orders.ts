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
			app
				.post(
					"/",
					async ({ profile, body, status }) => {
						const { userItemId, shippingInfoId } = body;

						// Check if user has the item
						// const [existing] = await db
						// 	.select()
						// 	.from(userItems)
						// 	.where(
						// 		and(
						// 			eq(userItems.profileId, profile.id),
						// 			eq(userItems.id, userItemId),
						// 		),
						// 	);
						const existing = await db.query.userItems.findFirst({
							where: {
								id: userItemId,
								profileId: profile.id,
							},
							with: {
								item: {
									with: { group: true },
								},
							},
						});

						if (!existing) {
							throw new Error("Item not found in inventory");
						}
						if (!existing.item) {
							throw new Error("Item not found");
						}
						if (!existing.item.isActive) {
							throw new Error("Item is not available for order");
						}
						if (!(existing.item.isEx || existing.item.group?.isEx)) {
							throw new Error("Item is not eligible for burn");
						}

						const [order] = await db.transaction(async (tx) => {
							await tx.delete(userItems).where(eq(userItems.id, existing.id));
							return await tx
								.insert(orders)
								.values({
									itemId: existing.itemId,
									status: "pending",
									profileId: profile.id,
									shippingInfoId: shippingInfoId,
								})
								.returning();
						});

						if (!order) {
							throw new Error("Failed to create order");
						}

						return status(200, {
							success: true,
							data: order,
							timestamp: Date.now(),
						});
					},
					{
						body: t.Object({
							userItemId: t.Number(),
							shippingInfoId: t.Optional(t.Number()),
						}),
						response: baseResponseSchema(t.Object({ ...dbSchemaTypes.orders })),
					},
				)
				.get(
					"/mine",
					async ({ profile, status }) => {
						const data = await db.query.orders.findMany({
							where: { profileId: profile.id },
							with: {
								item: true,
								shippingInfo: true,
							},
						});
						return status(200, {
							success: true,
							data,
							timestamp: Date.now(),
						});
					},
					{
						response: {
							200: baseResponseSchema(
								Type.Array(
									Type.Object({
										...dbSchemaTypes.orders,
										item: Type.Union([
											Type.Optional(Type.Object(dbSchemaTypes.items)),
											Type.Null(),
											Type.Undefined(),
										]),
										shippingInfo: Type.Union([
											Type.Optional(Type.Object(dbSchemaTypes.shippingInfo)),
											Type.Null(),
											Type.Undefined(),
										]),
									}),
								),
							),
						},
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
								shippingInfo: true,
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
										shippingInfo: Type.Union([
											Type.Optional(Type.Object(dbSchemaTypes.shippingInfo)),
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
