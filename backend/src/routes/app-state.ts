import Elysia, { t } from "elysia";
import { db } from "../database";
import { AppState } from "../database/schema";
import { eq } from "drizzle-orm";
import { authenticationMiddleware } from "../middleware/auth";
import { baseResponseSchema } from "../types";

export const appStateRouter = new Elysia({ prefix: "/app-state" })
	.get("/", async ({ status }) => {
		const [appState] = await db.select().from(AppState).limit(1);
		return status(200, {
			success: true,
			data: appState?.state || null,
			timestamp: Date.now(),
		});
	})
	.use(authenticationMiddleware)
	.guard({ roleAuth: ["admin"] }, (app) =>
		app.patch(
			"/pity-config",
			async ({ body, status }) => {
				const [appState] = await db.select().from(AppState).limit(1);

				if (!appState) {
					return status(404, {
						success: false,
						message: "App state not found",
						timestamp: Date.now(),
					});
				}

				const updatedState = {
					...appState.state,
					pityConfig: {
						...appState.state.pityConfig,
						...body,
					},
				};

				const [updated] = await db
					.update(AppState)
					.set({ state: updatedState })
					.where(eq(AppState.id, appState.id))
					.returning();

				return status(200, {
					success: true,
					data: updated.state,
					timestamp: Date.now(),
				});
			},
			{
				body: t.Object({
					enabled: t.Optional(t.Boolean()),
					rollsUntilPity: t.Optional(t.Number()),
					boostFormula: t.Optional(t.Union([t.Literal("inverse"), t.Literal("flat")])),
					winThreshold: t.Optional(t.Number()),
				}),
				response: {
					200: baseResponseSchema(t.Any()),
				},
			},
		),
	);
