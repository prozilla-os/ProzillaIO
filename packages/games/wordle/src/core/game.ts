import { ROW_COUNT, WORD_LENGTH } from "../constants/data";
import { CellType, GridType } from "../types/grid";
import themes from "./data/words";
import dictionary from "./data/dictionary";
import { removeDuplicatesFromArray } from "@prozilla-os/shared";

export class Game {
	word: string;
	private validGuesses: string[];
	private words: string[];
	private themes: Record<string, string[]>;
    
	constructor() {
		this.validGuesses = [];
		this.words = [];
		this.word = "drill";
		this.themes = {};

		this.loadWords();
	}

	// Loads words and valid guesses
	loadWords() {
		this.themes = themes;
		Object.values(this.themes).forEach((themedWords: string[]) => {
			this.words = this.words.concat(themedWords);
		});

		this.words = removeDuplicatesFromArray(this.words);

		this.validGuesses = [
			...this.words,
			...dictionary
		];

		this.chooseRandomWord();
	}

	// Select a random word from the list
	chooseRandomWord() {
		const randIndex = Math.floor(Math.random() * this.words.length);
		this.word = this.words[randIndex];
	}

	// Process the guess and update the game state
	checkGuess(guess: CellType[]): { status: CellType["status"][], correct: boolean } {
		const guessLetters = guess.map(({ content }) => content);
		const result: CellType["status"][] = [];
		let correctLetters = 0;
		const letters = this.word.split("");

		for (let i = 0; i < WORD_LENGTH; i++) {
			result.push(0);
		}

		// Mark green letters
		guessLetters.forEach((letter, i) => {
			if (letters[i] === letter) {
				result[i] = 2;
				letters[i] = null!;
				correctLetters++;
			}
		});

		// Mark yellow letters
		guessLetters.forEach((letter, i) => {
			if (!result[i] && letters.includes(letter)) {
				result[i] = 1;
				letters[letters.indexOf(letter)] = null!;
			}
		});

		const won = correctLetters === WORD_LENGTH;
		return { status: result, correct: won };
	}

	isValidGuess(guess: CellType[]): boolean {
		const word = Game.rowToWord(guess);
		return this.validGuesses.includes(word);
	}

	// Restarts the game
	restart() {
		this.chooseRandomWord();
	}

	static createGrid(): GridType {
		const grid = [];
		for (let i = 0; i < ROW_COUNT; i++) {
			const row = [];
			for (let j = 0; j < WORD_LENGTH; j++) {
				row.push({
					content: "",
					status: null
				} as CellType);
			}
			grid.push(row);
		}
		return grid;
	}

	static rowToWord(row: CellType[]): string {
		return row.map(({ content }) => content).join("");
	} 
}
