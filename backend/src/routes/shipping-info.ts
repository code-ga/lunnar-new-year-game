import { Type } from "@sinclair/typebox";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db } from "../database";
import { shippingInfo, profile } from "../database/schema";
import { dbSchemaTypes } from "../database/type";
import { authenticationMiddleware } from "../middleware/auth";
import { baseResponseSchema, errorResponseSchema } from "../types";

export const shippingInfoRouter = new Elysia({ prefix: "/shipping-info" })
	.use(authenticationMiddleware)
	.guard(
		{ profileAuth: true },
		(app) =>
			app
				.get(
					"/",
					async ({ profile: p, status }) => {
						const data = await db
							.select()
							.from(shippingInfo)
							.where(eq(shippingInfo.profileId, p.id));
						return status(200, {
							success: true,
							data,
							timestamp: Date.now(),
						});
					},
					{
						response: {
							200: baseResponseSchema(
								Type.Array(Type.Object(dbSchemaTypes.shippingInfo)),
							),
						},
					},
				)
				.post(
					"/",
					async ({ profile: p, body, status }) => {
						const [created] = await db
							.insert(shippingInfo)
							.values({
								profileId: p.id,
								fullName: body.fullName,
								phone: body.phone,
								address: body.address,
								note: body.note,
							})
							.returning();

						// If this is the user's first shipping info, set as default
						const existing = await db
							.select()
							.from(shippingInfo)
							.where(eq(shippingInfo.profileId, p.id));
						if (existing.length === 1 && created) {
							await db
								.update(profile)
								.set({ defaultShippingInfoId: created.id })
								.where(eq(profile.id, p.id));
						}

						return status(201, {
							success: true,
							data: created,
							timestamp: Date.now(),
						});
					},
					{
						body: t.Object({
							fullName: t.String(),
							phone: t.String(),
							address: t.String(),
							note: t.Optional(t.String()),
						}),
						response: {
							201: baseResponseSchema(
								Type.Optional(Type.Object(dbSchemaTypes.shippingInfo)),
							),
						},
					},
				)
				.put(
					"/:id",
					async ({ profile: p, params, body, status }) => {
						const [updated] = await db
							.update(shippingInfo)
							.set({
								fullName: body.fullName,
								phone: body.phone,
								address: body.address,
								note: body.note,
							})
							.where(
								and(
									eq(shippingInfo.id, parseInt(params.id)),
									eq(shippingInfo.profileId, p.id),
								),
							)
							.returning();
						if (!updated) {
							return status(404, {
								status: 404,
								message: "Shipping info not found",
								timestamp: Date.now(),
								success: false,
							});
						}
						return status(200, {
							success: true,
							data: updated,
							timestamp: Date.now(),
						});
					},
					{
						params: t.Object({ id: t.String() }),
						body: t.Object({
							fullName: t.String(),
							phone: t.String(),
							address: t.String(),
							note: t.Optional(t.String()),
						}),
						response: {
							200: baseResponseSchema(
								Type.Optional(Type.Object(dbSchemaTypes.shippingInfo)),
							),
							404: errorResponseSchema,
						},
					},
				)
				.delete(
					"/:id",
					async ({ profile: p, params, status }) => {
						const [deleted] = await db
							.delete(shippingInfo)
							.where(
								and(
									eq(shippingInfo.id, parseInt(params.id)),
									eq(shippingInfo.profileId, p.id),
								),
							)
							.returning();
						if (!deleted) {
							return status(404, {
								status: 404,
								message: "Shipping info not found",
								timestamp: Date.now(),
								success: false,
							});
						}
						// If this was the default, clear it
						if (p.defaultShippingInfoId === deleted.id) {
							await db
								.update(profile)
								.set({ defaultShippingInfoId: null })
								.where(eq(profile.id, p.id));
						}
						return status(200, {
							success: true,
							data: deleted,
							timestamp: Date.now(),
						});
					},
					{
						params: t.Object({ id: t.String() }),
						response: {
							200: baseResponseSchema(
								Type.Optional(Type.Object(dbSchemaTypes.shippingInfo)),
							),
							404: errorResponseSchema,
						},
					},
				),
	);
