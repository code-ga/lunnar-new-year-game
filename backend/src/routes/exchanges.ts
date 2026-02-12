import { Type } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db } from "../database";
import { exchanges, userItems, items } from "../database/schema";
import { dbSchemaTypes } from "../database/type";
import { authenticationMiddleware } from "../middleware/auth";
import crypto from "node:crypto";
import { baseResponseSchema } from "../types";

export const exchangesRouter = new Elysia({ prefix: "/exchanges" })
	.use(authenticationMiddleware)
	.guard(
		{
			profileAuth: true,
		},
		(app) =>
			app
				.post(
					"/",
					async ({ profile: userProfile, body, status }) => {
						const { userItemId } = body;

						// Check if user has the item
						const [existing] = await db
							.select()
							.from(userItems)
							.where(
								and(
									eq(userItems.profileId, userProfile.id),
									eq(userItems.id, userItemId),
								),
							);

						if (!existing) {
							throw new Error("Item not found in inventory");
						}

						// Get item rarity to keep the same code format
						const [itemDetails] = await db
							.select()
							.from(items)
							.where(eq(items.id, existing.itemId));

						if (!itemDetails) {
							throw new Error("Item template not found");
						}

						// Generate a code (PIL-ItemId-Rarity-Random)
						const randomSuffix = crypto
							.randomBytes(4)
							.toString("hex")
							.toUpperCase();
						const code = `PIL-${itemDetails.id}-${itemDetails.rarity}-${randomSuffix}`;

						await db.transaction(async (tx) => {
							// if (existing.quantity > 1) {
							// 	await tx
							// 		.update(userItems)
							// 		.set({ quantity: existing.quantity - 1 })
							// 		.where(eq(userItems.id, existing.id));
							// } else {
							// 	await tx.delete(userItems).where(eq(userItems.id, existing.id));
							// }

							// await tx.insert(exchanges).values({
							// 	profileId: userProfile.id,
							// 	itemId: existing.itemId,
							// 	code: code,
							// });
							await tx.delete(userItems).where(eq(userItems.id, existing.id));
							return await tx
								.insert(exchanges)
								.values({
									profileId: userProfile.id,
									itemId: existing.itemId,
									code: code,
								})
								.returning();
						});

						return status(200, {
							success: true,
							data: {
								code: code,
							},
							timestamp: Date.now(),
						});
					},
					{
						body: t.Object({
							userItemId: t.Number(),
						}),
						response: {
							200: baseResponseSchema(
								t.Object({
									code: t.Optional(t.String()),
								}),
							),
						},
					},
				)
				.post(
					"/claim",
					async ({ profile: userProfile, body, status }) => {
						const { code } = body;

						const [exchange] = await db
							.select()
							.from(exchanges)
							.where(
								and(
									eq(exchanges.code, code.toUpperCase()),
									eq(exchanges.isClaimed, false),
								),
							);

						if (!exchange) {
							throw new Error("Mã code không hợp lệ hoặc đã được nhận");
						}

						await db.transaction(async (tx) => {
							await tx
								.update(exchanges)
								.set({
									isClaimed: true,
									claimedById: userProfile.id,
									claimedAt: new Date(),
								})
								.where(eq(exchanges.id, exchange.id));

							// Add item to claimer's inventory
							// We generate a new userItem record
							await tx.insert(userItems).values({
								profileId: userProfile.id,
								itemId: exchange.itemId,
								// quantity: 1,
							});
						});

						// Get item info for response
						const [item] = await db
							.select()
							.from(items)
							.where(eq(items.id, exchange.itemId));

						return status(200, {
							success: true,
							data: {
								item: item || undefined,
							},
							timestamp: Date.now(),
						});
					},
					{
						body: t.Object({
							code: t.String(),
						}),
						response: baseResponseSchema(
							t.Object({
								item: t.Optional(Type.Object(dbSchemaTypes.items)),
							}),
						),
					},
				),
	);
