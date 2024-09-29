import { App, Vector2, WebView, WindowProps } from "@prozilla-os/core";
import iconSvg from "../public/icon.svg";

interface MinesweeperProps extends WindowProps {};

const minesweeper = new App<MinesweeperProps>("Minesweeper", "minesweeper", WebView, {
	source: "https://prozilla.dev/minesweeper",
	size: new Vector2(500, 580)
});

minesweeper.setIconUrl(iconSvg);

export { minesweeper };