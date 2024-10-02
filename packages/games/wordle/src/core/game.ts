// import * as themes from "../../public/data/words.json";
// import * as dictionary from "../../public/data/dictionary.json";
import { ROW_COUNT, WORD_LENGTH } from "../constants/data";
import { clamp, randomFromArray } from "@prozilla-os/core";

type LetterType = {
	correctness: 0 | 1 | 2; // 0: wrong, 1: in wrong place, 2: correct
	value: string;
};
type RowType = Record<number, LetterType[]>;

export class Game {
	activeCellIndex: number | null;
	activeRowIndex = 0;

	correctWord?: string;
	candidateWords: string[] = [];

	submittedRows: RowType = {};
	currentWord: string[] = [];
	validWords: string[] = [];

	constructor() {
		this.activeCellIndex = 0;

		const validateWord = (word: string) => {
			if (word.length == 5 && !this.validWords.includes(word))
				this.validWords.push(word);
		}

		// TO DO: dynamically import dictionary and themes to seperate their chunks

		const dictionary = { "test": "test " };
		const themes = { "test": "test" };

		// Store 5 letter words from dictionary as valid words
		for (const [key, value] of Object.entries(dictionary)) {
			validateWord(key);
			value.split(" ").forEach(validateWord);
		}

		// Store themed words as candidate words
		Object.values(themes).forEach((themedWords) => {
			this.candidateWords = this.candidateWords.concat(themedWords);
		});

		this.pickRandomWord();
	}

	pickRandomWord() {
		this.correctWord = randomFromArray(this.candidateWords);
	}

	getRow(index: number): LetterType[] {
		if (this.activeRowIndex == index) {
			return this.currentWord.map((letter) => {
				return {
					value: letter,
					correctness: 0
				}
			});
		} else {
			return this.submittedRows[index] ?? [];
		}
	}

	enterKey(key: string) {
		key = key.toLowerCase();

		if (this.activeCellIndex == null)
			return;

		if (key.length == 1 && key.match(/[a-z]/g)) {
			this.setActiveCellInput(key);
			this.moveActiveCell(true);
		} else {
			switch (key) {
				case " ":
					this.moveActiveCell(true);
					break;
				case "arrowright":
					this.moveActiveCell(true, true);
					break;
				case "arrowleft":
					this.moveActiveCell(false);
					break;
				case "backspace":
					if (!this.currentWord[this.activeCellIndex])
						this.moveActiveCell(false);
					this.clearActiveCellInput();
					break;
				case "enter":
					this.submitRow();
					break;
			}
		}
	}

	setActiveCellInput(letter: string) {
		if (this.activeCellIndex == null)
			return;

		this.currentWord[this.activeCellIndex] = letter;
	}

	clearActiveCellInput() {
		this.setActiveCellInput("");
	}

	isActiveCellEmpty() {
		return this.activeCellIndex == null || !this.currentWord[this.activeCellIndex];
	}

	moveActiveCell(forwards: boolean, disallowHop?: boolean) {
		let newCellIndex = this.activeCellIndex ?? 0;
		newCellIndex = forwards ? newCellIndex + 1 : newCellIndex -1;
		newCellIndex = clamp(newCellIndex, 0, WORD_LENGTH - 1);

		if (newCellIndex != this.activeCellIndex) {
			this.activeCellIndex = newCellIndex;

			if (!disallowHop && forwards && newCellIndex < WORD_LENGTH - 1 && !this.isActiveCellEmpty()) {
				this.moveActiveCell(true);
			}
		}
	}

	submitRow() {
		let validGuess = true;
		for (let i = 0; i < WORD_LENGTH; i++) {
			if (!this.currentWord[i])
				validGuess = false;
		}

		if (!validGuess)
			return;

		const currentWord = this.currentWord.join("");
		if (!this.validWords.includes(currentWord) && !this.candidateWords.includes(currentWord)) {
			validGuess = false;

			// Show popup and run row shake animation
		}

		if (validGuess)
			this.nextRow();
	}

	nextRow() {
		if (!this.correctWord)
			throw new Error("No correct word picked.");

		const correctLetters: (string | null)[] = this.correctWord?.split("");
		let correctLettersAmount = 0;

		this.submittedRows[this.activeRowIndex] = [];
		const submittedRow = this.submittedRows[this.activeRowIndex];

		for (let i = 0; i < WORD_LENGTH; i++) {
			const letter = this.currentWord[i];

			if (correctLetters[i] == letter) {
				submittedRow[i] = {
					correctness: 2,
					value: letter
				};

				correctLetters[i] = null;
				correctLettersAmount++;
			}
		}

		for (let i = 0; i < WORD_LENGTH; i++) {
			const letter = this.currentWord[i];

			if (submittedRow[i] != null)
				continue;

			if (correctLetters.includes(letter)) {
				submittedRow[i] = {
					correctness: 1,
					value: letter
				};
			} else {
				submittedRow[i] = {
					correctness: 0,
					value: letter
				};
			}
		}

		if (correctLettersAmount == WORD_LENGTH) {
			this.endGame(true, true);
		} else if (this.activeRowIndex == ROW_COUNT - 1) {
			this.endGame(false, true);
		} else {
			this.activeRowIndex++;
			this.activeCellIndex = 0;
			this.currentWord = [];
		}
	}

	endGame(won: boolean, delay: boolean) {
		this.activeCellIndex = null;

		// Wait for reveal animation to finish, then hide keyboard, then activate confetti and popup
	}

	restartGame() {
		// Reset all colors, animations, etc. and show keyboard

		this.submittedRows = {};
		this.currentWord = [];
		this.activeRowIndex = 0;
		this.pickRandomWord();
	}
}