import { GridType } from "../../../types/grid";
import styles from "./Grid.module.css";
import { Row } from "./row/Row";

interface GridProps {
	grid: GridType;
	activeRowIndex: number;
	activeCellIndex: number;
	setActiveCellIndex: (index: number) => void;
}

export function Grid({ grid, activeRowIndex, activeCellIndex, setActiveCellIndex }: GridProps) {
	return <div className={styles.Grid}>
		{grid.map((row, rowIndex) =>
			<Row key={rowIndex} row={row} active={rowIndex == activeRowIndex} activeCellIndex={activeCellIndex} setActiveCellIndex={setActiveCellIndex}/>
		)}
	</div>;
}