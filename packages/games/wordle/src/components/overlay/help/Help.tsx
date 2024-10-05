import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Help.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useClassNames } from "@prozilla-os/core";
import { Row } from "../../play-area/grid/row/Row";

interface HelpProps {
	toggleHelp: Function;
	helpVisible: boolean;
}

export function Help({ toggleHelp, helpVisible }: HelpProps) {
	const classNames = [styles["Help-container"]];

	if (helpVisible)
		classNames.push(styles.Active);

	return <div className={useClassNames(classNames)}>
		<span className={styles.Help}>
			<button title="Hide Help" onClick={() => { toggleHelp(false); }}>
				<FontAwesomeIcon icon={faXmark}/>
			</button>
			<h1>How to play</h1>
			<p>Guess the word in 6 tries or less.</p>
			<p>Each guess must be a valid 5-letter word. Hit the enter button to submit.</p>
			<p>After each guess, the color of the tiles will change to show how close your guess was to the word.</p>
			<h2>Examples</h2>
			<Row
				active={false}
				activeCellIndex={0}
				row={[
					{ content: "g", status: null },
					{ content: "r", status: 2 },
					{ content: "a", status: null },
					{ content: "s", status: null },
					{ content: "s", status: null }
				]}
			/>
			<p>The letter <strong>R</strong> is in the word and in the correct spot.</p>
			<Row
				active={false}
				activeCellIndex={0}
				row={[
					{ content: "f", status: null },
					{ content: "i", status: null },
					{ content: "e", status: 1 },
					{ content: "l", status: null },
					{ content: "d", status: null }
				]}
			/>
			<p>The letter <strong>E</strong> is in the word but in the wrong spot.</p>
			<Row
				active={false}
				activeCellIndex={0}
				row={[
					{ content: "o", status: null },
					{ content: "c", status: null },
					{ content: "e", status: null },
					{ content: "a", status: 0 },
					{ content: "n", status: null }
				]}
			/>
			<p>The letter <strong>A</strong> is not in the word in any spot.</p>
			<p>This game was made by Prozilla and inspired by the official <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank">Wordle</a>.</p>
		</span>
	</div>;
}