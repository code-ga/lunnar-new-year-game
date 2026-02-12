import { and, eq, gt, or } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { db } from "../database";
import { items, schema } from "../database/schema";
import { authenticationMiddleware } from "../middleware/auth";
import { baseResponseSchema } from "../types";
import { dbSchemaTypes } from "../database/type";
import { Type } from "@sinclair/typebox";

const websocketConnections: Record<string, any> = {};
const turboClickTokenMap: Record<string, string> = {};
const COST = 50;

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
					async ({ profile, body, status }) => {
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

						return status(200, { result, winAmount });
					},
					{
						body: t.Object({
							gameId: t.String(),
							bets: t.Array(t.Number()),
						}),
						response: {
							200: t.Object({
								result: t.Any(),
								winAmount: t.Number(),
							}),
						},
					},
				)
				// Gacha Roll - Group-based with Pity System
				.post(
					"/roll",
					async ({ profile, status }) => {
						if (profile.coins < COST) throw new Error("Not enough coins");

						// Step 1: Get pity config from AppState
						const [appState] = await db.select().from(schema.AppState).limit(1);
						const pityConfig = appState?.state.pityConfig || {
							enabled: false,
							rollsUntilPity: 10,
							boostFormula: "inverse" as const,
							winThreshold: 500,
						};

						// Step 2: Get all active groups
						const allGroups = await db
							.select()
							.from(schema.itemGroups)
							.where(eq(schema.itemGroups.isActive, true));

						if (allGroups.length === 0)
							throw new Error("No groups available");

						// Step 3: Calculate group chances with pity boost
						const groupChances = await Promise.all(
							allGroups.map(async (group) => {
								// Check if group has available items
								const groupItems = await db
									.select()
									.from(items)
									.where(
										and(
											eq(items.groupId, group.id),
											eq(items.isActive, true),
											or(gt(items.quantity, 0), eq(items.quantity, -1)),
										),
									);

								if (groupItems.length === 0) {
									return { group, chance: 0 };
								}

								let chance = group.baseChance / 100; // Convert from basis points

								// Apply pity boost
								if (
									pityConfig.enabled &&
									profile.consecutiveRollsWithoutWin >= pityConfig.rollsUntilPity
								) {
									const pityMultiplier = Math.floor(
										profile.consecutiveRollsWithoutWin / pityConfig.rollsUntilPity,
									);
									if (pityConfig.boostFormula === "inverse") {
										// Lower chance groups get more boost (inverse relationship)
										const boost = (1 / chance) * 0.1 * pityMultiplier;
										chance += boost;
									} else {
										// Flat boost
										chance += 0.5 * pityMultiplier;
									}
								}

								return { group, chance };
							}),
						);

						// Normalize chances to 100%
						const totalChance = groupChances.reduce(
							(sum, g) => sum + g.chance,
							0,
						);
						if (totalChance === 0) throw new Error("No items available");

						const normalizedGroupChances = groupChances.map((g) => ({
							...g,
							chance: g.chance / totalChance,
						}));

						// Step 4: Select group randomly
						const rand = Math.random();
						let cumulative = 0;
						let selectedGroup = normalizedGroupChances[0].group;

						for (const { group, chance } of normalizedGroupChances) {
							cumulative += chance;
							if (rand <= cumulative) {
								selectedGroup = group;
								break;
							}
						}

						// Step 5: Get items in selected group
						const groupItems = await db
							.select()
							.from(items)
							.where(
								and(
									eq(items.groupId, selectedGroup.id),
									eq(items.isActive, true),
									or(gt(items.quantity, 0), eq(items.quantity, -1)),
								),
							);

						if (groupItems.length === 0)
							throw new Error("No items in selected group");

						// Step 6: Calculate item chances within group
						const infiniteItems = groupItems.filter((i) => i.quantity === -1);
						const finiteItems = groupItems.filter((i) => i.quantity > 0);

						let rolledItem: (typeof groupItems)[0];

						if (infiniteItems.length > 0 && finiteItems.length > 0) {
							// Mixed: infinite items use manual chance, finite items share remainder
							const totalManualChance =
								infiniteItems.reduce((sum, i) => sum + (i.manualChance || 0), 0) /
								100;
							const finiteChance = 1 - totalManualChance;
							const totalFiniteQty = finiteItems.reduce(
								(sum, i) => sum + i.quantity,
								0,
							);

							const itemChances = [
								...infiniteItems.map((i) => ({
									item: i,
									chance: (i.manualChance || 0) / 100,
								})),
								...finiteItems.map((i) => ({
									item: i,
									chance: finiteChance * (i.quantity / totalFiniteQty),
								})),
							];

							const rand2 = Math.random();
							let cumulative2 = 0;
							for (const { item, chance } of itemChances) {
								cumulative2 += chance;
								if (rand2 <= cumulative2) {
									rolledItem = item;
									break;
								}
							}
							rolledItem = rolledItem! || itemChances[0].item;
						} else if (infiniteItems.length > 0) {
							// All infinite: use manual chances (or equal distribution if not set)
							const totalManualChance = infiniteItems.reduce(
								(sum, i) => sum + (i.manualChance || 100 / infiniteItems.length),
								0,
							);
							const rand2 = Math.random() * totalManualChance;
							let cumulative2 = 0;
							for (const item of infiniteItems) {
								cumulative2 += item.manualChance || 100 / infiniteItems.length;
								if (rand2 <= cumulative2) {
									rolledItem = item;
									break;
								}
							}
							rolledItem = rolledItem! || infiniteItems[0];
						} else {
							// All finite: weighted by quantity
							const totalQty = finiteItems.reduce((sum, i) => sum + i.quantity, 0);
							const rand2 = Math.random() * totalQty;
							let cumulative2 = 0;
							for (const item of finiteItems) {
								cumulative2 += item.quantity;
								if (rand2 <= cumulative2) {
									rolledItem = item;
									break;
								}
							}
							rolledItem = rolledItem! || finiteItems[0];
						}

						// Step 7: Execute transaction
						const result = await db.transaction(async (tx) => {
							// Deduct coins
							await tx
								.update(schema.profile)
								.set({ coins: profile.coins - COST })
								.where(eq(schema.profile.id, profile.id));

							// Decrease quantity if finite
							if (rolledItem.quantity > 0) {
								await tx
									.update(items)
									.set({ quantity: rolledItem.quantity - 1 })
									.where(eq(items.id, rolledItem.id));
							}

							// Create user item
							const [userItem] = await tx
								.insert(schema.userItems)
								.values({
									profileId: profile.id,
									itemId: rolledItem.id,
								})
								.returning();

							// Update pity counter
							const isWin = selectedGroup.baseChance <= pityConfig.winThreshold;
							const newPityCount = isWin
								? 0
								: profile.consecutiveRollsWithoutWin + 1;

							await tx
								.update(schema.profile)
								.set({ consecutiveRollsWithoutWin: newPityCount })
								.where(eq(schema.profile.id, profile.id));

							return { userItem, newPityCount };
						});

						return status(200, {
							success: true,
							data: {
								rolledItem,
								userCoins: profile.coins - COST,
								userItems: [result.userItem],
								pityCount: result.newPityCount,
								selectedGroup: selectedGroup.name,
							},
							timestamp: Date.now(),
						});
					},
					{
						response: {
							200: baseResponseSchema(
								Type.Object({
									rolledItem: Type.Object(dbSchemaTypes.items),
									userCoins: Type.Number(),
									userItems: Type.Array(Type.Object(dbSchemaTypes.userItems)),
									pityCount: Type.Number(),
									selectedGroup: Type.String(),
								}),
							),
						},
					},
				)
				// Skill Game endpoints (stubbed logic for brevity)
				.post("/play/skill/start", async () => {
					return { sessionId: crypto.randomUUID(), startTime: Date.now() };
				})
				.post(
					"/play/skill/end",
					async ({ profile, body }) => {
						const { score } = body;

						const reward = Math.round(score / 5);
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
				)
				.post(
					"/play/turbo-click/ws",
					async ({ profile }) => {
						// generate a URL or token for WS connection (handled in WS section	)
						const token = crypto.randomUUID();
						turboClickTokenMap[token] = profile.id;
						return { success: true, token };
					},
					{},
				),
	)
	.ws("/ws/turbo-click/:token", {
		open(ws) {
			console.log("Turbo Click WS opened");
			// ws.data.score = 0;
			// ws.data.startTime = Date.now();
			websocketConnections[ws.id] = { score: 0, startTime: Date.now() };
		},
		message(ws, message: any) {
			console.log("Turbo Click WS message", message);
			if (message.type === "click") {
				websocketConnections[ws.id].score += 1;
				const timeElapsed =
					(Date.now() - websocketConnections[ws.id].startTime) / 1000;
				const timeleft = Math.max(10 - timeElapsed);

				ws.send({
					type: "update",
					score: websocketConnections[ws.id].score,
					timeleft,
				});
				if (timeleft <= 0) {
					ws.send({
						type: "end",
						score: websocketConnections[ws.id].score,
						reward: Math.round(websocketConnections[ws.id].score / 5),
					});
					ws.close();
					return;
				}
			}
		},
		async close(ws) {
			console.log("Turbo Click WS closed");
			const profile =
				ws.data.profile ||
				(typeof turboClickTokenMap[ws.data.params.token] === "string"
					? await db
							.select()
							.from(schema.profile)
							.where(
								eq(
									schema.profile.id,
									turboClickTokenMap[ws.data.params.token]!,
								),
							)
							.limit(1)
							.then((res) => res[0])
					: null);
			if (!profile) return;

			const userData = await db
				.select()
				.from(schema.profile)
				.where(eq(schema.profile.id, profile.id))
				.limit(1);
			if (userData.length === 0 || !websocketConnections[ws.id] || !userData[0])
				return;
			const user = userData[0];

			const finalScore = websocketConnections[ws.id].score;
			const reward = Math.round(finalScore / 5);
			await db
				.update(schema.profile)
				.set({ coins: user.coins + reward })
				.where(eq(schema.profile.id, profile.id));
		},
		idleTimeout: 60000,
		sendPings: true,
	});
