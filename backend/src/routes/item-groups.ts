import Elysia, { t } from "elysia";
import { db } from "../database";
import { itemGroups } from "../database/schema";
import { eq } from "drizzle-orm";
import { authenticationMiddleware } from "../middleware/auth";
import { baseResponseSchema } from "../types";

export const itemGroupsRouter = new Elysia({ prefix: "/item-groups" })
	.get("/", async ({ status }) => {
		const groups = await db
			.select()
			.from(itemGroups)
			.where(eq(itemGroups.isActive, true));

		return status(200, {
			success: true,
			data: groups,
			timestamp: Date.now(),
		});
	})
	.use(authenticationMiddleware)
	.guard({ roleAuth: ["admin"] }, (app) =>
		app
			.post(
				"/",
				async ({ body, status }) => {
					const [newGroup] = await db
						.insert(itemGroups)
						.values(body)
						.returning();

					return status(200, {
						success: true,
						data: newGroup,
						timestamp: Date.now(),
					});
				},
				{
					body: t.Object({
						name: t.String(),
						baseChance: t.Number(),
						isEx: t.Optional(t.Boolean()),
						isActive: t.Optional(t.Boolean()),
					}),
					response: {
						200: baseResponseSchema(t.Any()),
					},
				},
			)
			.put(
				"/:id",
				async ({ params: { id }, body, status }) => {
					const [updated] = await db
						.update(itemGroups)
						.set(body)
						.where(eq(itemGroups.id, Number.parseInt(id)))
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
						name: t.Optional(t.String()),
						baseChance: t.Optional(t.Number()),
						isEx: t.Optional(t.Boolean()),
						isActive: t.Optional(t.Boolean()),
					}),
					response: {
						200: baseResponseSchema(t.Any()),
					},
				},
			)
			.delete(
				"/:id",
				async ({ params: { id }, status }) => {
					const [deleted] = await db
						.delete(itemGroups)
						.where(eq(itemGroups.id, Number.parseInt(id)))
						.returning();

					return status(200, {
						success: true,
						data: deleted,
						timestamp: Date.now(),
					});
				},
				{
					params: t.Object({ id: t.String() }),
					response: {
						200: baseResponseSchema(t.Any()),
					},
				},
			),
	);
