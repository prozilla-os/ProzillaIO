import { AppsConfig, settings, fileExplorer } from "prozilla-os";
import { minesweeper } from "@prozilla-os/minesweeper";
import { wordle } from "@prozilla-os/wordle";
import { ballMaze } from "@prozilla-os/ball-maze";

const games = [
	minesweeper,
	wordle,
	ballMaze
];

export const appsConfig = new AppsConfig({
	apps: [
		...games.map((game) => {
			game.setShowDesktopIcon(true);
			game.setPinnedByDefault(true);

			return game;
		}),
		settings.setPinnedByDefault(true)
			.setShowDesktopIcon(false),
		fileExplorer.setPinnedByDefault(false)
			.setShowDesktopIcon(false),
	],
});