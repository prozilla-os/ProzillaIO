import { useEffect, useMemo } from "react";
import { useSingleton, WindowProps } from "@prozilla-os/core";
import difficulties from "../data/difficulties.json";
import { Board } from "../core/board";
import { Game } from "../core/game";
import { Particles } from "../core/particles";
import { useGameStore } from "../hooks/game/game";
import { GameGrid } from "./grid/GameGrid";
import { Header } from "./header/Header";
import styles from "./Minesweeper.module.css";

export function Minesweeper({}: WindowProps) {
	const { particles, game } = useSingleton(() => {
		const particles = new Particles();
		return { particles, game: new Game(particles) };
	});
	const snap = useGameStore(game);

	useEffect(() => {
		return () => {
			game.dispose();
			particles.dispose();
		};
	}, [game, particles]);

	const bombTotal = difficulties[snap.difficultyKey].bombs;
	const flags = useMemo(() => {
		const usedFlags = Board.countFlagged(snap.board.cells);
		return Math.max(bombTotal - usedFlags, 0);
	}, [bombTotal, snap.board.cells]);

	return <div className={styles.Palette} ref={(element) => particles.attachPalette(element)}>
		<Header
			difficulty={snap.difficultyKey}
			flags={flags}
			seconds={snap.seconds}
			onRestart={(level) => {
				game.reset(level);
			}}
		/>
		<GameGrid
			board={snap.board}
			onReveal={(index, tile, manualClick) => {
				particles.setTileScaleFromElement(tile);
				game.revealCell(index, tile, manualClick ?? false);
			}}
			onToggleFlag={(index, tile) => {
				particles.setTileScaleFromElement(tile);
				game.toggleFlag(index, tile);
			}}
			onRegisterTile={(index, tile) => {
				game.tileElements[index] = tile;
			}}
		/>
		<canvas ref={(element) => particles.attachCanvas(element)} className={styles.ParticlesCanvas}/>
	</div>;
}
