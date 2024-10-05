import { CellType, GridType } from "../../types/grid";
import { Grid } from "./grid/Grid";
import { Keyboard } from "./keyboard/Keyboard";
import styles from "./PlayArea.module.css";

interface PlayAreaProps {
	grid: GridType;
	activeRowIndex: number;
	activeCellIndex: number;
	onKeyPress: (key: string) => void;
	keyHighlights: Record<string, CellType["status"]>;
	gameOver: boolean;
}

export function PlayArea({ grid, activeRowIndex, activeCellIndex, onKeyPress, keyHighlights, gameOver }: PlayAreaProps) {
	return <main className={styles.PlayArea}>
		<Grid grid={grid} activeRowIndex={activeRowIndex} activeCellIndex={activeCellIndex}/>
		<Keyboard onKeyPress={onKeyPress} gameOver={gameOver} keyHighlights={keyHighlights}/>
	</main>;
}