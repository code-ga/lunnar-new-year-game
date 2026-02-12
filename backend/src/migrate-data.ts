import { db } from "./database/index";
import { itemGroups, items, schema } from "./database/schema";
import { eq, sql } from "drizzle-orm";

async function migrateData() {
	console.log("Starting data migration...");

	try {
		// Step 1: Check if groups already exist
		const existingGroups = await db.select().from(itemGroups);

		if (existingGroups.length === 0) {
			console.log("Inserting default groups...");

			const defaultGroups = [
				{ name: "Common (E-D)", baseChance: 5500, isEx: false, isActive: true },
				{ name: "Uncommon (C-B)", baseChance: 3000, isEx: false, isActive: true },
				{ name: "Rare (A)", baseChance: 1000, isEx: false, isActive: true },
				{ name: "Epic (S-SS)", baseChance: 400, isEx: false, isActive: true },
				{ name: "Legendary (SSS)", baseChance: 90, isEx: false, isActive: true },
				{ name: "Cosmic (EX)", baseChance: 10, isEx: true, isActive: true },
			];

			await db.insert(itemGroups).values(defaultGroups);
			console.log("✓ Default groups created");
		} else {
			console.log("Groups already exist, skipping...");
		}

		// Step 2: Get all groups for mapping
		const groups = await db.select().from(itemGroups);
		const groupMap: Record<string, number> = {};
		for (const group of groups) {
			groupMap[group.name] = group.id;
		}

		// Step 3: Migrate existing items to groups based on rarity
		console.log("Migrating items to groups...");

		const allItems = await db.select().from(items);
		let migratedCount = 0;

		for (const item of allItems) {
			// Skip if already assigned to a group
			if (item.groupId !== null) {
				continue;
			}

			let targetGroupId: number | null = null;

			// Map rarity to group
			switch (item.rarity) {
				case "E":
				case "D":
					targetGroupId = groupMap["Common (E-D)"];
					break;
				case "C":
				case "B":
					targetGroupId = groupMap["Uncommon (C-B)"];
					break;
				case "A":
					targetGroupId = groupMap["Rare (A)"];
					break;
				case "S":
				case "SS":
					targetGroupId = groupMap["Epic (S-SS)"];
					break;
				case "SSS":
					targetGroupId = groupMap["Legendary (SSS)"];
					break;
				case "EX":
					targetGroupId = groupMap["Cosmic (EX)"];
					break;
				default:
					// Default to Common if unknown rarity
					targetGroupId = groupMap["Common (E-D)"];
			}

			if (targetGroupId) {
				await db
					.update(items)
					.set({ groupId: targetGroupId })
					.where(eq(items.id, item.id));
				migratedCount++;
			}
		}

		console.log(`✓ Migrated ${migratedCount} items to groups`);

		// Step 4: Update app_state with pity config if not exists
		console.log("Updating app state...");
		const [appState] = await db.select().from(schema.AppState).limit(1);

		if (appState && !appState.state.pityConfig) {
			await db
				.update(schema.AppState)
				.set({
					state: {
						...appState.state,
						pityConfig: {
							enabled: true,
							rollsUntilPity: 10,
							boostFormula: "inverse" as const,
							winThreshold: 500,
						},
					},
				})
				.where(eq(schema.AppState.id, appState.id));
			console.log("✓ App state updated with pity config");
		} else {
			console.log("Pity config already exists or no app state found");
		}

		console.log("\n✅ Data migration completed successfully!");
	} catch (error) {
		console.error("❌ Migration failed:", error);
		process.exit(1);
	}

	process.exit(0);
}

migrateData();
