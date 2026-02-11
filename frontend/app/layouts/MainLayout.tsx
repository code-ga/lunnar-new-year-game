import React, { useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
	Sparkles,
	Library,
	Gamepad2,
	User,
	Repeat,
	Coins,
	Cloud,
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";

const MainLayout: React.FC = () => {
	const { user, fetchUserData } = useGameStore();
	const location = useLocation();

	useEffect(() => {
		fetchUserData();
	}, []);
	const navItems = [
		{ id: "gacha", label: "Gacha", icon: Sparkles, path: "/" },
		{ id: "collection", label: "Túi Đồ", icon: Library, path: "/collection" },
		{ id: "games", label: "Game", icon: Gamepad2, path: "/games" },
		{ id: "exchange", label: "Trao Đổi", icon: Repeat, path: "/exchange" },
		{ id: "profile", label: "Tài Khoản", icon: User, path: "/profile" },
		...(user?.permission.includes("admin")
			? [{ id: "admin", label: "Admin", icon: User, path: "/admin" }]
			: []),
	];

	return (
		<div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden">
			{/* Sidebar Desktop */}
			<div className="hidden md:flex flex-col w-64 bg-white shadow-xl z-20 shrink-0">
				<div className="p-6 border-b border-slate-100">
					<h1 className="text-2xl font-black text-indigo-600 flex items-center gap-2">
						<Sparkles size={28} className="fill-indigo-600" /> PillowWorld
					</h1>
					<div className="mt-6 flex flex-col gap-2">
						<div className="flex items-center gap-2 bg-yellow-100 p-3 rounded-lg text-yellow-800 font-bold border border-yellow-300">
							<Coins size={20} />
							<span>{(user?.coins || 0).toLocaleString()} Xu</span>
						</div>
					</div>
				</div>
				<nav className="flex-1 py-4 space-y-1">
					{navItems.map((item) => (
						<Link
							key={item.id}
							to={item.path}
							className={`flex items-center space-x-3 w-full px-6 py-4 text-left transition-colors ${
								location.pathname === item.path
									? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600"
									: "text-slate-500 hover:bg-slate-50"
							}`}
						>
							<item.icon
								size={20}
								className={
									location.pathname === item.path ? "fill-indigo-600" : ""
								}
							/>
							<span className="font-bold">{item.label}</span>
						</Link>
					))}
				</nav>
			</div>

			<main className="flex-1 relative h-full bg-slate-50 pt-14 md:pt-0 pb-16 md:pb-0 overflow-hidden">
				<div className="h-full overflow-y-auto no-scrollbar">
					<Outlet />
				</div>
			</main>

			{/* Bottom Nav Mobile */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around z-30 pb-safe">
				{navItems
					.filter((i) => i.id !== "exchange")
					.map((item) => (
						<Link
							key={item.id}
							to={item.path}
							className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
								location.pathname === item.path
									? "text-indigo-600"
									: "text-slate-400"
							}`}
						>
							<item.icon
								size={24}
								className={
									location.pathname === item.path ? "fill-indigo-600" : ""
								}
							/>
							<span className="text-[10px] font-bold mt-1">{item.label}</span>
						</Link>
					))}
			</nav>
		</div>
	);
};

export default MainLayout;
