import Elysia from "elysia";
import { betterAuthRouter } from "./auth";
import { healthRoutes } from "./health";
import { profileRouter } from "./profile";
import { itemsRouter } from "./items";
import { ordersRouter } from "./orders";
import { gameRouter } from "./game";
import { exchangesRouter } from "./exchanges";
import { shippingInfoRouter } from "./shipping-info";

const apiRouter = new Elysia({ prefix: "/api" })
	.use(betterAuthRouter)
	.use(healthRoutes)
	.use(profileRouter)
	.use(itemsRouter)
	.use(ordersRouter)
	.use(gameRouter)
	.use(exchangesRouter)
	.use(shippingInfoRouter);

export { apiRouter };
