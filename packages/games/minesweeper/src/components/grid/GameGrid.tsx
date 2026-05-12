import React, { useEffect, useRef, useState } from "react";
import styles from "./GameGrid.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faFlag } from "@fortawesome/free-solid-svg-icons";

interface CellState {
	hasBomb: boolean;
	revealed: boolean;
	flagged: boolean;
	adjacentBombs: number;
}

interface GameGridProps {
	board: CellState[];
	size: number;
	onReveal: (index: number, tile: HTMLButtonElement, manualClick?: boolean) => void;
	onToggleFlag: (index: number, tile: HTMLButtonElement) => void;
	onRegisterTile: (index: number, tile: HTMLButtonElement | null) => void;
}

export function GameGrid({ board, size, onReveal, onToggleFlag, onRegisterTile }: GameGridProps) {
	const holdTimeout = useRef<number | null>(null);
	const holdCompleted = useRef<boolean>(false);
	const mainRef = useRef<HTMLElement | null>(null);
	const [gridPixelSize, setGridPixelSize] = useState<number>(0);

	useEffect(() => {
		const mainElement = mainRef.current;
		const containerElement = mainElement?.parentElement;
		if (mainElement == null || containerElement == null) {
			return;
		}

		const resizeGrid = () => {
			const cssMargin = getComputedStyle(containerElement).getPropertyValue("--grid-margin").trim();
			const defaultMargin = Number.parseInt(cssMargin, 10) || 50;
			const margin = containerElement.clientWidth <= 660 ? 20 : defaultMargin;
			const headerElement = mainElement.previousElementSibling as HTMLElement | null;
			const headerHeight = headerElement?.getBoundingClientRect().height ?? 0;

			const horizontalSpace = containerElement.clientWidth - margin * 2;
			const verticalSpace = containerElement.clientHeight - headerHeight - margin;
			const sizePx = Math.max(Math.min(horizontalSpace, verticalSpace), 0);
			setGridPixelSize(sizePx);
		};

		const resizeObserver = new ResizeObserver(() => {
			resizeGrid();
		});

		resizeGrid();
		resizeObserver.observe(containerElement);
		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	const gridStyle: React.CSSProperties & Record<"--icon-size", string> = {
		gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
		gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
		width: `${gridPixelSize}px`,
		height: `${gridPixelSize}px`,
		"--icon-size": `${Math.max(gridPixelSize / Math.max(size, 1) / 3, 1)}px`
	};

	return (
		<main className={styles.Main} ref={mainRef}>
			<div
				className={styles.Grid}
				style={gridStyle}
			>
				{board.map((cell, index) => {
					const x = index % size;
					const y = Math.floor(index / size);
					const odd = x % 2 === y % 2;
					const classes = [
						styles.Tile,
						odd ? styles.Odd : "",
						cell.revealed ? styles.Dug : "",
						cell.flagged ? styles.Flag : "",
						cell.revealed && cell.hasBomb ? styles.Bomb : ""
					].filter(Boolean).join(" ");
					const displayNumber = cell.revealed && !cell.hasBomb && cell.adjacentBombs > 0;

					return (
						<button
							key={index}
							ref={(tile) => {
								onRegisterTile(index, tile);
							}}
							type="button"
							className={classes}
							onMouseDown={(event) => {
								event.preventDefault();
								if (event.button === 2) {
									return;
								}
								holdCompleted.current = false;
								holdTimeout.current = window.setTimeout(() => {
									onToggleFlag(index, event.currentTarget);
									holdCompleted.current = true;
								}, 250);
							}}
							onMouseUp={(event) => {
								event.preventDefault();
								if (event.button === 2) {
									return;
								}
								if (holdTimeout.current !== null) {
									window.clearTimeout(holdTimeout.current);
								}
								if (!holdCompleted.current) {
									onReveal(index, event.currentTarget, true);
								}
								holdCompleted.current = false;
							}}
							onContextMenu={(event) => {
								event.preventDefault();
								onToggleFlag(index, event.currentTarget);
							}}
							onTouchStart={(event) => {
								event.preventDefault();
								holdCompleted.current = false;
								holdTimeout.current = window.setTimeout(() => {
									onToggleFlag(index, event.currentTarget as HTMLButtonElement);
									holdCompleted.current = true;
								}, 250);
							}}
							onTouchEnd={(event) => {
								event.preventDefault();
								if (holdTimeout.current !== null) {
									window.clearTimeout(holdTimeout.current);
								}
								if (!holdCompleted.current) {
									onReveal(index, event.currentTarget as HTMLButtonElement, true);
								}
								holdCompleted.current = false;
							}}
						>
							{displayNumber ? cell.adjacentBombs : ""}
							{cell.revealed && cell.hasBomb ? <FontAwesomeIcon icon={faCircle} className={styles.BombIcon} /> : null}
							{!cell.revealed && cell.flagged ? <FontAwesomeIcon icon={faFlag} className={styles.FlagIcon} /> : null}
						</button>
					);
				})}
			</div>
		</main>
	);
}
