import Elysia from "elysia";
import { authenticationMiddleware } from "../middleware/auth";

export const adminRouter = new Elysia({ prefix: "/admin" })
  .use(authenticationMiddleware).guard({
  roleAuth: ["admin"]
},app=>app.get("/", () => "Admin"))