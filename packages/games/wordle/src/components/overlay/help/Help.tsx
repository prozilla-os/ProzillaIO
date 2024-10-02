import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Help.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface HelpProps {
	toggleHelp: Function;
}

export function Help({ toggleHelp }: HelpProps) {
	return <div className={styles["Help-container"]}>
		<span className={styles.Help}>
			<button title="Hide Help" onClick={() => { toggleHelp(); }}>
				<FontAwesomeIcon icon={faXmark}/>
			</button>
			<h1>How to play</h1>
			<p>Guess the word in 6 tries or less.</p>
			<p>Each guess must be a valid 5-letter word. Hit the enter button to submit.</p>
			<p>After each guess, the color of the tiles will change to show how close your guess was to the word.</p>
			<h2>Examples</h2>
			{/* <ul class="row">
				<li class="cell">g</li>
				<li class="cell green">r</li>
				<li class="cell">a</li>
				<li class="cell">s</li>
				<li class="cell">s</li>
			</ul> */}
			<p>The letter <strong>R</strong> is in the word and in the correct spot.</p>
			{/* <ul class="row">
				<li class="cell">f</li>
				<li class="cell">i</li>
				<li class="cell yellow">e</li>
				<li class="cell">l</li>
				<li class="cell">d</li>
			</ul> */}
			<p>The letter <strong>E</strong> is in the word but in the wrong spot.</p>
			{/* <ul class="row">
				<li class="cell">o</li>
				<li class="cell">c</li>
				<li class="cell">e</li>
				<li class="cell gray">a</li>
				<li class="cell">n</li>
			</ul> */}
			<p>The letter <strong>A</strong> is not in the word in any spot.</p>
			<p>This game was made by Prozilla and inspired by the official <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank">Wordle</a>.</p>
		</span>
	</div>;
}