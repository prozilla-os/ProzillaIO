import { App, Vector2, WindowProps } from "@prozilla-os/core";
import iconSvg from "../public/icon.svg";
import { Minesweeper } from "./components/Minesweeper";

const minesweeper = new App<WindowProps>("Minesweeper", "minesweeper", Minesweeper, {
	size: new Vector2(500, 580)
});

minesweeper.setIconUrl(iconSvg);

export { minesweeper };