import Elysia from "elysia";
import { betterAuthRouter } from "./auth";
import { healthRoutes } from "./health";
import { profileRouter } from "./profile";
import { itemsRouter } from "./items";
import { itemGroupsRouter } from "./item-groups";
import { ordersRouter } from "./orders";
import { gameRouter } from "./game";
import { exchangesRouter } from "./exchanges";
import { shippingInfoRouter } from "./shipping-info";
import { appStateRouter } from "./app-state";

const apiRouter = new Elysia({ prefix: "/api" })
	.use(betterAuthRouter)
	.use(healthRoutes)
	.use(profileRouter)
	.use(itemsRouter)
	.use(itemGroupsRouter)
	.use(ordersRouter)
	.use(gameRouter)
	.use(exchangesRouter)
	.use(shippingInfoRouter)
	.use(appStateRouter);

export { apiRouter };
