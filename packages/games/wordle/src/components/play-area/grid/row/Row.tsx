import { useClassNames } from "@prozilla-os/core";
import { Cell } from "./cell/Cell";
import styles from "./Row.module.css";
import { CellType } from "../../../../types/grid";

interface RowProps {
    row: CellType[];
    active: boolean;
    activeCellIndex: number;
    setActiveCellIndex?: (index: number) => void;
}

export function Row({ row, active, activeCellIndex, setActiveCellIndex }: RowProps) {
    const classNames = [styles.Row];

    if (active)
        classNames.push(styles.Active);

    return <ul className={useClassNames(classNames)}>
        {row.map((cell, cellIndex) =>
            <Cell 
                key={cellIndex} 
                active={active && cellIndex == activeCellIndex} 
                cell={cell}
                onClick={active ? () => setActiveCellIndex?.(cellIndex) : undefined}
            />
        )}
    </ul>;
}