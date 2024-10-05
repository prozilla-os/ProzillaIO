import { useCallback, useRef, useState } from "react";
import { Header } from "./header/Header";
import { Overlay } from "./overlay/Overlay";
import { PlayArea } from "./play-area/PlayArea";
import styles from "./Wordle.module.css";
import { Game } from "../core/game";
import { WindowProps } from "@prozilla-os/core";
import { WORD_LENGTH } from "../constants/data";
import { clamp } from "@prozilla-os/shared";
import { CellType, GridType } from "../types/grid";
import utilStyles from "../styles/utils.module.css";

export function Wordle({ active }: WindowProps) {
	const wordleRef = useRef<HTMLDivElement>(null);
	const [game] = useState<Game>(new Game());
	const [gameOver, setGameOver] = useState(false);
	const [grid, setGrid] = useState<GridType>(Game.createGrid());
	const [keyHighlights, setKeyHighlights] = useState<Record<string, CellType["status"]>>({});
	const [activeRowIndex, setActiveRowIndex] = useState(0);
	const [activeCellIndex, setActiveCellIndex] = useState(0);
	const [popup, setPopup] = useState<string | null>(null);
	const [helpVisible, setHelpVisible] = useState(false);

	const moveActiveCell = useCallback((forwards: boolean) => {
		let newCellIndex = forwards ? activeCellIndex + 1 : activeCellIndex - 1;
		newCellIndex = clamp(newCellIndex, 0, WORD_LENGTH - 1);

		if (newCellIndex != activeCellIndex)
			setActiveCellIndex(newCellIndex);
	}, [activeCellIndex]);

	const handleKeyPress = useCallback((key: string) => {
		if (!active || gameOver)
			return;

		key = key.toLowerCase();

		const updatedGrid = [...grid];
		const currentRow = updatedGrid[activeRowIndex];

		if (key === "enter") {
			if (!game.isValidGuess(currentRow)) {
				setPopup(`${Game.rowToWord(currentRow).toUpperCase()} is not a valid word.`);
				return;
			}

			const { status, correct } = game.checkGuess(currentRow);
			
			const newKeyHighlights = keyHighlights;
			currentRow.forEach((cell, index) => {
				cell.status = status[index];
				newKeyHighlights[cell.content] = status[index];
			});
			setKeyHighlights(newKeyHighlights);

			if (correct) {
				setPopup("Congratulations, you won!");
				setGameOver(true);
			} else if (activeRowIndex === 5) {
				setPopup(`You lost! The word was ${game.word.toUpperCase()}.`);
				setGameOver(true);
			} else {
				setActiveRowIndex(activeRowIndex + 1);
				setActiveCellIndex(0);
			}
		} else if (key === "backspace") {
			if (currentRow[activeCellIndex].content != "") {
				currentRow[activeCellIndex].content = "";
			} else if (activeCellIndex > 0) {
				currentRow[activeCellIndex - 1].content = "";
				moveActiveCell(false);
			}
		} else if (key.match(/^[a-z]$/g)) {
			currentRow[activeCellIndex].content = key;
			updatedGrid[activeRowIndex] = currentRow;

			moveActiveCell(true);
		}

		setGrid(updatedGrid);
	}, [game, grid, activeRowIndex, activeCellIndex, keyHighlights]);

	const restartGame = () => {
		wordleRef.current?.classList.add(utilStyles["No-transition"]);
		game.restart();
		setGrid(Game.createGrid());
		setActiveRowIndex(0);
		setActiveCellIndex(0);
		setKeyHighlights({});
		setPopup(null);
		setGameOver(false);

		setTimeout(() => {
			wordleRef.current?.classList.remove(utilStyles["No-transition"]);			
		}, 100);
	};

	const toggleHelp = (visible?: boolean) => {
		if (visible != null) {
			setHelpVisible(visible);
		} else {
			setHelpVisible(!helpVisible);
		}
	};

	return <div ref={wordleRef} className={styles.Wordle}>
		<Header toggleHelp={toggleHelp} restartGame={restartGame}/>
		<PlayArea
			grid={grid}
			activeRowIndex={activeRowIndex}
			activeCellIndex={activeCellIndex}
			onKeyPress={handleKeyPress}
			keyHighlights={keyHighlights}
			gameOver={gameOver}
		/>
		<Overlay
			toggleHelp={toggleHelp}
			helpVisible={helpVisible}
			popup={popup}
		/>
	</div>;
}