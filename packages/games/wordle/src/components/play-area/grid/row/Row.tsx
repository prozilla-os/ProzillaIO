import { useClassNames } from "prozilla-os";
import styles from "./Row.module.css";
import { useGameContext } from "../../../../hooks/gameContext";

interface RowProps {
	index: number;
}

export function Row({ index }: RowProps) {
	const game = useGameContext();

	const classNames = [styles.Row];

	if (game.activeRowIndex == index)
		classNames.push(styles.Active);

	return <ul className={useClassNames(classNames)}>
		{game && game.getRow(index).map(({ value, correctness }, letterIndex) =>
			<li key={letterIndex} className={styles.Cell} data-correctness={correctness}>{value}</li>
		)}
	</ul>;
}