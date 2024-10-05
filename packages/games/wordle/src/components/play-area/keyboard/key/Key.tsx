import styles from "./Key.module.css";
import { CellType } from "../../../../types/grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import { useClassNames } from "@prozilla-os/core";

interface KeyProps {
	onKeyPress: (key: string) => void;
	value: string;
	keyHighlights: Record<string, CellType["status"]>;
}

export function Key({ value, onKeyPress, keyHighlights }: KeyProps) {
	const classNames = [styles.Key];

	if (value == "backspace")
		classNames.push(styles.Backspace);

	switch (keyHighlights[value]) {
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

	return <button className={useClassNames(classNames)} onClick={() => { onKeyPress(value); }}>
		{value == "backspace"
			? <FontAwesomeIcon icon={faDeleteLeft}/>
			: value
		}
	</button>;
}