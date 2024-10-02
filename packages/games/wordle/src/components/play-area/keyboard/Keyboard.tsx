import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Keyboard.module.css";
import { faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import { useGameContext } from "../../../hooks/gameContext";
import { useEffect } from "react";

const KEYBOARD_ROWS = [
	["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
	["a", "s", "d", "f", "g", "h", "j", "k", "l"],
	["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"]
];

interface KeyboardProps {
	isFocused: boolean;
}

export function Keyboard({ isFocused }: KeyboardProps) {
	const game = useGameContext();

	useEffect(() => {
		if (!isFocused)
			return;

		const onKeyDown = (event: KeyboardEvent) => {
			game.enterKey(event.key);
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isFocused]);

	return <div className={styles.Keyboard}>
		{KEYBOARD_ROWS.map((keys, index) =>
			<div key={index} className={styles.Row}>
				{keys.map((key) => {
					if (key == "backspace") {
						return <button key={key} className={styles.Key} onClick={() => { game.enterKey(key); }}>
							<FontAwesomeIcon icon={faDeleteLeft}/>
						</button>;
					} else {
						return <button key={key} className={styles.Key} onClick={() => { game.enterKey(key); }}>{key}</button>;
					}
				})}
			</div>
		)}
	</div>;
}