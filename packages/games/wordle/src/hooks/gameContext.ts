import { createContext, useContext } from "react";
import { Game } from "../core/game";

export const GameContext = createContext<Game | null>(null);

export function useGameContext(): Game {
	const game = useContext(GameContext);

	if (!game)
		throw new Error("Game not initialized correctly.");

	return game;
}
