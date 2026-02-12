import React from "react";
import GamesHub from "../components/GamesHub";
import type { GameId } from "../types";
import type { Route } from "./+types/GamesPage";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Trò Chơi - Thế Giới Gacha Gối Ôm" },
		{
			name: "description",
			content: "Chơi các mini-game để kiếm thêm Xu gacha!",
		},
	];
}

const GamesPage: React.FC = () => {
	const [activeGame, setActiveGame] = React.useState<GameId | null>(null);

	return (
		<div className="h-full bg-slate-50">
			<GamesHub activeGame={activeGame} setActiveGame={setActiveGame} />
		</div>
	);
};

export default GamesPage;
