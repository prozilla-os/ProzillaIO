import { CellType, GridType } from "../../types/grid";
import { Grid } from "./grid/Grid";
import { Keyboard } from "./keyboard/Keyboard";
import styles from "./PlayArea.module.css";

interface PlayAreaProps {
	grid: GridType;
	activeRowIndex: number;
	activeCellIndex: number;
	setActiveCellIndex: (index: number) => void;
	onKeyPress: (key: string) => void;
	keyHighlights: Record<string, CellType["status"]>;
	gameOver: boolean;
}

export function PlayArea({ grid, activeRowIndex, activeCellIndex, setActiveCellIndex, onKeyPress, keyHighlights, gameOver }: PlayAreaProps) {
	return <main className={styles.PlayArea}>
		<Grid grid={grid} activeRowIndex={activeRowIndex} activeCellIndex={activeCellIndex} setActiveCellIndex={setActiveCellIndex}/>
		<Keyboard onKeyPress={onKeyPress} gameOver={gameOver} keyHighlights={keyHighlights}/>
	</main>;
}