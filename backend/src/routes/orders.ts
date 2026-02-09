import Elysia, { t } from "elysia";
import { db } from "../database";
import { orders, userItems, items } from "../database/schema";
import { eq, and } from "drizzle-orm";
import { authenticationMiddleware } from "../middleware/auth";

export const ordersRouter = new Elysia({ prefix: "/orders" })
    .use(authenticationMiddleware)
    .guard({
        userAuth: true
    }, (app) => app
        .post("/", async ({ user, body }) => {
            const { itemId } = body;
            
            // Check if user has the item
            const [existing] = await db.select().from(userItems)
                .where(and(eq(userItems.userId, user!.id), eq(userItems.itemId, itemId)));
            
            if (!existing || existing.quantity <= 0) {
                throw new Error("Item not found in inventory");
            }

            // atomicity-ish (simplified for this task)
            await db.transaction(async (tx) => {
                if (existing.quantity > 1) {
                    await tx.update(userItems)
                        .set({ quantity: existing.quantity - 1 })
                        .where(eq(userItems.id, existing.id));
                } else {
                    await tx.delete(userItems).where(eq(userItems.id, existing.id));
                }

                await tx.insert(orders).values({
                    userId: user!.id,
                    itemId: itemId,
                    status: "pending"
                });
            });

            return { success: true };
        }, {
            body: t.Object({
                itemId: t.Number()
            })
        })
    )
    .guard({
        roleAuth: ["admin"]
    }, (app) => app
        .get("/", async () => {
            return await db.query.orders.findMany({
                with: {
                    user: true,
                    item: true
                }
            });
        })
        .patch("/:id/status", async ({ params: { id }, body }) => {
            const [updated] = await db.update(orders)
                .set({ status: body.status })
                .where(eq(orders.id, parseInt(id)))
                .returning();
            return updated;
        }, {
            params: t.Object({ id: t.String() }),
            body: t.Object({
                status: t.Union([t.Literal("pending"), t.Literal("shipped"), t.Literal("rejected")])
            })
        })
    );
