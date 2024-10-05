import styles from "./Keyboard.module.css";
import { useEffect } from "react";
import { useClassNames } from "@prozilla-os/core";
import { CellType } from "../../../types/grid";
import { Key } from "./key/Key";

const KEYBOARD_KEYS = [
	["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
	["a", "s", "d", "f", "g", "h", "j", "k", "l"],
	["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"]
];

interface KeyboardProps {
	onKeyPress: (key: string) => void;
	keyHighlights: Record<string, CellType["status"]>;
	gameOver: boolean;
}

export function Keyboard({ onKeyPress, keyHighlights, gameOver }: KeyboardProps) {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			event.preventDefault();
			onKeyPress(event.key);
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [onKeyPress]);

	const classNames = [styles.Keyboard];

	if (gameOver)
		classNames.push(styles.Hidden);

	return <div className={useClassNames(classNames)}>
		{KEYBOARD_KEYS.map((keys, index) =>
			<div key={index} className={styles.Row}>
				{keys.map((key) => 
					<Key key={key} value={key} keyHighlights={keyHighlights} onKeyPress={onKeyPress}/>
				)}
			</div>
		)}
	</div>;
}