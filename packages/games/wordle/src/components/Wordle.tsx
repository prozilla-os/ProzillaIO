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
	const gameRef = useRef<Game | null>(null);
	if (gameRef.current == null) {
		gameRef.current = new Game();
	}
	const [gameOver, setGameOver] = useState(false);
	const [won, setWon] = useState(false);
	const [grid, setGrid] = useState<GridType>(Game.createGrid());
	const [keyHighlights, setKeyHighlights] = useState<Record<string, CellType["status"]>>({});
	const [activeRowIndex, setActiveRowIndex] = useState(0);
	const [activeCellIndex, setActiveCellIndex] = useState(0);
	const [popup, setPopup] = useState<string | null>(null);
	const [helpVisible, setHelpVisible] = useState(false);

	const game = gameRef.current;

	const moveActiveCell = useCallback((forwards: boolean) => {
		let newCellIndex = forwards ? activeCellIndex + 1 : activeCellIndex - 1;
		newCellIndex = clamp(newCellIndex, 0, WORD_LENGTH - 1);

		if (newCellIndex != activeCellIndex)
			setActiveCellIndex(newCellIndex);
	}, [activeCellIndex]);

	const handleKeyPress = useCallback((key: string, event?: KeyboardEvent) => {
		if (!active || gameOver)
			return;

		key = key.toLowerCase();

		const updatedGrid = [...grid];
		const currentRow = updatedGrid[activeRowIndex];
		const ctrlPressed = event === undefined ? false : event.ctrlKey || event.metaKey;
		const altPressed = event === undefined ? false : event.altKey;
		const specialKeyPressed = ctrlPressed || altPressed;

		let keyHandled = true;
		if (key === "enter") {
			if (!game.isValidGuess(currentRow)) {
				setPopup(`${Game.rowToWord(currentRow).toUpperCase()} is not a valid word.`);
				return;
			}

			const { status, correct } = game.checkGuess(currentRow);
			
			const newKeyHighlights = { ...keyHighlights };
			currentRow.forEach((cell, index) => {
				const newStatus = status[index];
				cell.status = newStatus ?? 0;

				const currentPriority = newKeyHighlights[cell.content] ?? -1;
				const newPriority = newStatus ?? 0;

				if (newPriority > currentPriority)
					newKeyHighlights[cell.content] = newStatus ?? 0;
			});
			setKeyHighlights(newKeyHighlights);

			if (correct) {
				setPopup("Congratulations, you won!");
				setGameOver(true);
				setWon(true);
			} else if (activeRowIndex === 5) {
				setPopup(`You lost! The word was ${game.word.toUpperCase()}.`);
				setGameOver(true);
			} else {
				setActiveRowIndex(activeRowIndex + 1);
				setActiveCellIndex(0);
			}
		} else if (key === "backspace") {
			if (ctrlPressed) {
				for (let i = 0; i <= activeCellIndex; i++) {
					currentRow[i].content = "";
				}
				setActiveCellIndex(0);
			} else {
				if (currentRow[activeCellIndex].content !== "") {
					currentRow[activeCellIndex].content = "";
				} else if (activeCellIndex > 0) {
					currentRow[activeCellIndex - 1].content = "";
					moveActiveCell(false);
				}
			}
		} else if (key === "delete") {
			if (ctrlPressed) {
				for (let i = activeCellIndex; i < WORD_LENGTH; i++) {
					currentRow[i].content = "";
				}
			} else {
				if (currentRow[activeCellIndex].content !== "") {
					currentRow[activeCellIndex].content = "";
				} else if (activeCellIndex < WORD_LENGTH - 1) {
					currentRow[activeCellIndex + 1].content = "";
					moveActiveCell(true);
				}
			}
		} else if (key === "escape") {
			if (helpVisible) {
				setHelpVisible(false);
			} else {
				currentRow.forEach(cell => {
					cell.content = "";
				});
				setActiveCellIndex(0);
			}
		} else if (ctrlPressed && key === "v") {
			navigator.clipboard?.readText().then((clipText) => {
				if (!clipText)
					return;
				const sanitized = clipText.replace(/[^a-zA-Z]/g, "").toLowerCase();
				if (!sanitized.length)
					return;

				const newGrid = [...grid];
				const row = newGrid[activeRowIndex];
				let cursor = activeCellIndex;

				for (let i = 0; i < sanitized.length && cursor < WORD_LENGTH; i++) {
					row[cursor].content = sanitized[i];
					cursor++;
				}

				setActiveCellIndex(clamp(cursor, 0, WORD_LENGTH - 1));
				setGrid(newGrid);
			}).catch(() => {});
		} else if (ctrlPressed && key === "c") {
			const wordToCopy = Game.rowToWord(currentRow);
			if (wordToCopy) {
				navigator.clipboard?.writeText(wordToCopy).catch(() => {});
			}
		} else if (key === "arrowleft") {
			if (ctrlPressed) {
				setActiveCellIndex(0);
			} else {
				moveActiveCell(false);
			}
		} else if (key === "arrowright") {
			if (ctrlPressed) {
				setActiveCellIndex(WORD_LENGTH - 1);
			} else {
				moveActiveCell(true);
			}
		} else if (key === "home") {
			setActiveCellIndex(0);
		} else if (key === "end") {
			setActiveCellIndex(WORD_LENGTH - 1);
		} else if (key === "arrowup") {
			setActiveCellIndex(0);
		} else if (key === "arrowdown") {
			setActiveCellIndex(WORD_LENGTH - 1);
		} else if (!specialKeyPressed && key.match(/^[a-z]$/g)) {
			currentRow[activeCellIndex].content = key;
			updatedGrid[activeRowIndex] = currentRow;

			moveActiveCell(true);
		} else {
			keyHandled = false;
		}

		if (keyHandled)
			event?.preventDefault();

		setGrid(updatedGrid);
	}, [game, grid, activeRowIndex, activeCellIndex, keyHighlights, active, gameOver, moveActiveCell, helpVisible]);

	const restartGame = () => {
		wordleRef.current?.classList.add(utilStyles["No-transition"]);
		game.restart();
		setGrid(Game.createGrid());
		setActiveRowIndex(0);
		setActiveCellIndex(0);
		setKeyHighlights({});
		setPopup(null);
		setGameOver(false);
		setWon(false);

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
			setActiveCellIndex={setActiveCellIndex}
			onKeyPress={handleKeyPress}
			keyHighlights={keyHighlights}
			gameOver={gameOver}
		/>
		<Overlay
			toggleHelp={toggleHelp}
			helpVisible={helpVisible}
			popup={popup}
			won={won}
		/>
	</div>;
}