import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { OpenAPI } from "./libs/auths/openAPI";
import { apiRouter } from "./routes";
import { appStateService } from "./services/AppState";

export const app = new Elysia()
	.use(
		cors({
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
			credentials: true,
		}),
	)
	.get("/", () => ({ lormas: "studio" }))
	.use(
		openapi({
			documentation: {
				components: await OpenAPI.components,
				paths: await OpenAPI.getPaths(),
			},
		}),
	)
	.use(appStateService)
	.use(apiRouter)
	.listen(3000);

console.log(`${app.server?.url} is now running!`);

export type App = typeof app;
export * as databaseTypes from "./database/type";
export * as requestTypes from "./types";
