import { App, Vector2, WebView, WindowProps } from "@prozilla-os/core";
import iconSvg from "../public/icon.svg";

interface WordleProps extends WindowProps {};

const wordle = new App<WordleProps>("Wordle", "wordle", WebView, {
	source: "https://prozilla.dev/wordle",
	size: new Vector2(400, 650)
});

wordle.setIconUrl(iconSvg);

export { wordle };