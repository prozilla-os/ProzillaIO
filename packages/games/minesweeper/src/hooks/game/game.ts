import { useSnapshot } from "valtio/react";
import type { Game } from "../../core/game";

export function useGameStore(game: Game) {
	return useSnapshot(game.store);
}
