import { App, Vector2, WebView, WindowProps } from "@prozilla-os/core";
import iconSvg from "../public/icon.svg";

interface BallMazeProps extends WindowProps {};

const ballMaze = new App<BallMazeProps>("Ball Maze", "ball-maze", WebView, {
	source: "https://prozilla.dev/ball-maze",
	size: new Vector2(600, 600)
});

ballMaze.setIconUrl(iconSvg);

export { ballMaze };