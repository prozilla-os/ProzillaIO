import { AppsConfig } from "@prozilla-os/core";
import { minesweeper } from "@prozilla-os/minesweeper";
import { wordle } from "@prozilla-os/wordle";
import { ballMaze } from "@prozilla-os/ball-maze";

export const appsConfig = new AppsConfig({
	apps: [
		minesweeper,
		wordle,
		ballMaze
	],
});