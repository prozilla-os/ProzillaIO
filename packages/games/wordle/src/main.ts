import { App, Vector2 } from "@prozilla-os/core";
import iconSvg from "../public/icon.svg";
import { Wordle } from "./components/Wordle";

const wordle = new App("Wordle", "wordle", Wordle, {
	size: new Vector2(400, 650)
});

wordle.setIconUrl(iconSvg)
	.setDescription("Guess the word in 6 tries or less. Each guess must be a valid 5-letter word. Hit the enter button to submit. After each guess, the color of the tiles will change to show how close your guess was to the word.");

export { wordle };