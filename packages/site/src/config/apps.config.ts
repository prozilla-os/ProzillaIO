import { AppsConfig, Vector2 } from "@prozilla-os/core";
import { minesweeper } from "@prozilla-os/minesweeper";
import { wordle } from "@prozilla-os/wordle";
import { ballMaze } from "@prozilla-os/ball-maze";
import { settings } from "@prozilla-os/settings";
import { fileExplorer } from "@prozilla-os/file-explorer";

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