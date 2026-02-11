import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db } from "../database";
import { items, schema } from "../database/schema";
import { authenticationMiddleware } from "../middleware/auth";

export const gameRouter = new Elysia({ prefix: "/game" })
	.use(authenticationMiddleware)
	.guard(
		{
			profileAuth: true,
		},
		(app) =>
			app
				// Daily Check-in
				.post("/check-in", async ({ profile }) => {
					const now = new Date();
					const oneDay = 24 * 60 * 60 * 1000;

					if (
						profile.lastCheckIn &&
						now.getTime() - profile.lastCheckIn.getTime() < oneDay
					) {
						return { success: false, message: "Already checked in today" };
					}

					const reward = 100; // Constant reward
					await db
						.update(schema.profile)
						.set({
							coins: profile.coins + reward,
							lastCheckIn: now,
						})
						.where(eq(schema.profile.id, profile.id));

					return { success: true, reward };
				})
				// Probability Games (Tai Xiu, Bau Cua)
				.post(
					"/play/probability",
					async ({ profile, body }) => {
						const { gameId, bets } = body;

						const totalBet = bets.reduce((a: number, b: number) => a + b, 0);
						if (profile.coins < totalBet) throw new Error("Not enough coins");

						let result: any;
						let winAmount = 0;

						if (gameId === "taixiu") {
							const dice = [1, 2, 3].map(
								() => Math.floor(Math.random() * 6) + 1,
							);
							const sum = dice.reduce((a, b) => a + b, 0);
							const outcome = sum >= 11 ? "TAI" : "XIU";
							result = { dice, sum, outcome };

							const xiuBet = bets[0] ?? 0;
							const taiBet = bets[1] ?? 0;
							if (outcome === "XIU" && xiuBet > 0) winAmount = xiuBet * 2;
							if (outcome === "TAI" && taiBet > 0) winAmount = taiBet * 2;
						} else if (gameId === "baucua") {
							const symbols = [0, 1, 2].map(() =>
								Math.floor(Math.random() * 6),
							);
							result = { symbols };
							const counts: Record<number, number> = {};
							symbols.map((s) => (counts[s] = (counts[s] || 0) + 1));

							bets.forEach((amt: number, idx: number) => {
								if (amt > 0 && counts[idx]) {
									winAmount += amt + amt * counts[idx];
								}
							});
						}

						await db
							.update(schema.profile)
							.set({ coins: profile.coins - totalBet + winAmount })
							.where(eq(schema.profile.id, profile.id));

						return { result, winAmount };
					},
					{
						body: t.Object({
							gameId: t.String(),
							bets: t.Array(t.Number()),
						}),
					},
				)
				// Gacha Roll
				.post("/roll", async ({ profile }) => {
					const COST = 50;
					if (profile.coins < COST) throw new Error("Not enough coins");

					const allItems = await db
						.select()
						.from(items)
						.where(eq(items.isActive, true));
					if (allItems.length === 0) throw new Error("No items available");

					const rolledItem =
						allItems[Math.floor(Math.random() * allItems.length)];
					if (!rolledItem) throw new Error("Item not found");

					await db.transaction(async (tx) => {
						await tx
							.update(schema.profile)
							.set({ coins: profile.coins - COST })
							.where(eq(schema.profile.id, profile.id));

						const [existing] = await tx
							.select()
							.from(schema.userItems)
							.where(
								and(
									eq(schema.userItems.userId, profile.userId),
									eq(schema.userItems.itemId, rolledItem.id),
								),
							);

						if (existing) {
							await tx
								.update(schema.userItems)
								.set({ quantity: existing.quantity + 1 })
								.where(eq(schema.userItems.id, existing.id));
						} else {
							await tx.insert(schema.userItems).values({
								userId: profile.userId,
								itemId: rolledItem.id,
								quantity: 1,
							});
						}
					});

					return rolledItem;
				})
				// Skill Game endpoints (stubbed logic for brevity)
				.post("/play/skill/start", async () => {
					return { sessionId: crypto.randomUUID(), startTime: Date.now() };
				})
				.post(
					"/play/skill/end",
					async ({ profile, body }) => {
						const { score } = body;

						const reward = Math.floor(score / 5);
						await db
							.update(schema.profile)
							.set({ coins: profile.coins + reward })
							.where(eq(schema.profile.id, profile.id));

						return { success: true, reward };
					},
					{
						body: t.Object({
							sessionId: t.String(),
							score: t.Number(),
						}),
					},
				),
	)
	.ws("/ws/turbo-click", {
		open(ws) {
			console.log("Turbo Click WS opened");
			//@ts-expect-error
			ws.data.score = 0;
			//@ts-expect-error
			ws.data.startTime = Date.now();
		},
		message(ws, message: any) {
			if (message.type === "click") {
				//@ts-expect-error
				ws.data.score++;
				//@ts-expect-error
				ws.send({ type: "update", score: ws.data.score });
			}
		},
		async close(ws) {
			const { profile } = ws.data;
			if (!profile) return;

			//@ts-expect-error
			const timeElapsed = (Date.now() - ws.data.startTime) / 1000;
			// Basic validation: avoid awarding for < 1s play or impossible click rates
			//@ts-expect-error
			if (timeElapsed >= 9 && ws.data.score / timeElapsed < 20) {
				//@ts-expect-error
				const reward = Math.floor(ws.data.score / 5);
				if (reward > 0) {
					await db
						.update(schema.profile)
						.set({ coins: profile.coins + reward })
						.where(eq(schema.profile.id, profile.id));
					console.log(`Awarded ${reward} coins to ${profile.id}`);
				}
			}
		},
	});
