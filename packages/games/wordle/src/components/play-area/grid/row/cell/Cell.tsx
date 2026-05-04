import { useClassNames } from "@prozilla-os/core";
import { CellType } from "../../../../../types/grid";
import styles from "./Cell.module.css";

interface CellProps {
	cell: CellType;
	active: boolean;
	onClick?: () => void;
}

export function Cell({ cell, active, onClick }: CellProps) {
	const classNames = [styles.Cell];

	switch (cell.status) {
		case 2:
			classNames.push(styles.Green);
			break;
		case 1:
			classNames.push(styles.Yellow);
			break;
		case 0:
			classNames.push(styles.Gray);
			break;
	}

	if (active)
		classNames.push(styles.Active);

	return (
		<li 
			className={useClassNames(classNames)} 
			onClick={onClick}
			style={onClick ? { cursor: "pointer" } : undefined}
		>
			{cell.content}
		</li>
	);
}