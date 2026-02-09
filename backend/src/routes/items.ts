import Elysia, { t } from "elysia";
import { db } from "../database";
import { items } from "../database/schema";
import { eq } from "drizzle-orm";
import { authenticationMiddleware } from "../middleware/auth";

export const itemsRouter = new Elysia({ prefix: "/items" })
    .get("/", async () => {
        return await db.select().from(items).where(eq(items.isActive, true));
    })
    .use(authenticationMiddleware)
    .guard({
        roleAuth: ["admin"]
    }, (app) => app
        .post("/", async ({ body }) => {
            const [newItem] = await db.insert(items).values(body).returning();
            return newItem;
        }, {
            body: t.Object({
                name: t.String(),
                description: t.Optional(t.String()),
                image: t.Optional(t.String()),
                rarity: t.Optional(t.String()),
                isActive: t.Optional(t.Boolean())
            })
        })
        .put("/:id", async ({ params: { id }, body }) => {
            const [updatedItem] = await db.update(items)
                .set(body)
                .where(eq(items.id, parseInt(id)))
                .returning();
            return updatedItem;
        }, {
            params: t.Object({ id: t.String() }),
            body: t.Object({
                name: t.Optional(t.String()),
                description: t.Optional(t.String()),
                image: t.Optional(t.String()),
                rarity: t.Optional(t.String()),
                isActive: t.Optional(t.Boolean())
            })
        })
        .delete("/:id", async ({ params: { id } }) => {
            const [deletedItem] = await db.delete(items)
                .where(eq(items.id, parseInt(id)))
                .returning();
            return deletedItem;
        }, {
            params: t.Object({ id: t.String() })
        })
    );
