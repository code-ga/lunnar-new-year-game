import {
	type RouteConfig,
	index,
	layout,
	route,
  
} from "@react-router/dev/routes";

export default [
	route("login", "routes/LoginPage.tsx"),
	layout("layouts/MainLayout.tsx", [
		index("routes/HomePage.tsx"),
		route("admin", "routes/AdminPage.tsx"),
		route("profile", "routes/ProfilePage.tsx"),
		route("collection", "routes/CollectionPage.tsx"),
		route("exchange", "routes/ExchangePage.tsx"),
		route("games", "routes/GamesPage.tsx"),
	]),
] satisfies RouteConfig;
