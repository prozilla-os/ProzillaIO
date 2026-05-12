import { proxy } from "valtio";
import { DEFAULT_DIFFICULTY, TILE_REVEAL_DELAY } from "../constants/const";
import difficulties from "../data/difficulties.json";
import { Board } from "./board";
import type { Particles } from "./particles";

export type DifficultyKey = keyof typeof difficulties;

export type GameState = "playing" | "won" | "lost";

export interface GameStore {
	difficultyKey: DifficultyKey;
	board: Board;
	seconds: number;
	gameState: GameState;
	generatedBombs: boolean;
	gameId: number;
}

export class Game {
	readonly store: GameStore;
	readonly particles: Particles;
	tileElements: Array<HTMLButtonElement | null> = [];

	private revealTimeouts: number[] = [];
	private bombIndices: number[] = [];
	private correctFlagsCount = 0;
	private timerInterval: number | null = null;

	constructor(particles: Particles) {
		this.particles = particles;
		this.store = proxy<GameStore>({
			difficultyKey: DEFAULT_DIFFICULTY,
			board: Board.empty(difficulties[DEFAULT_DIFFICULTY].size),
			seconds: 0,
			gameState: "playing",
			generatedBombs: false,
			gameId: 0,
		});
		this.startTimer();
	}

	private get size(): number {
		return difficulties[this.store.difficultyKey].size;
	}

	private get bombCount(): number {
		return difficulties[this.store.difficultyKey].bombs;
	}

	dispose(): void {
		this.clearRevealTimeouts();
		this.stopTimer();
	}

	reset(level?: DifficultyKey): void {
		this.clearRevealTimeouts();
		const nextLevel = level ?? this.store.difficultyKey;
		this.store.difficultyKey = nextLevel;
		this.store.board = Board.empty(difficulties[nextLevel].size);
		this.store.seconds = 0;
		this.store.gameState = "playing";
		this.store.generatedBombs = false;
		this.store.gameId += 1;
		this.correctFlagsCount = 0;
		this.bombIndices = [];
		this.startTimer();
	}

	revealCell(index: number, tile?: HTMLButtonElement | null, manualClick = false): void {
		if (manualClick && this.store.gameState !== "playing") {
			return;
		}

		let nextBoard: Board;
		if (!this.store.generatedBombs) {
			nextBoard = this.applyBombPlacement(index, this.store.board);
			this.store.generatedBombs = true;
		} else {
			nextBoard = this.store.board.clone();
		}

		const cell = nextBoard.cells[index];
		if (cell.revealed) {
			this.store.board = nextBoard;
			return;
		}
		if (cell.flagged && this.store.gameState === "playing") {
			cell.flagged = false;
			if (cell.hasBomb) {
				this.correctFlagsCount -= 1;
			}
			this.store.board = nextBoard;
			return;
		}

		cell.revealed = true;
		if (cell.hasBomb) {
			this.particles.emitFromTile(tile ?? this.tileElements[index] ?? null, ["background-color-b", "background-color-c"], 0, 1);
			if (this.store.gameState === "playing") {
				this.store.board = this.endGameWithLoss(nextBoard);
				return;
			}
			this.store.board = nextBoard;
			return;
		}
		this.particles.emitFromTile(tile ?? this.tileElements[index] ?? null, ["sand-a", "sand-b"], 0, 1);

		const xPos = index % this.size;
		const yPos = Math.floor(index / this.size);
		const bombsNearTile = nextBoard.countBombsNear(xPos, yPos);
		if (bombsNearTile === 0 && manualClick) {
			const checked = new Set<number>();
			const revealArea = (active: Board, x: number, y: number, depth: number): void => {
				if (active.countBombsNear(x, y) !== 0) {
					return;
				}
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 3; j++) {
						const tx = x + i - 1;
						const ty = y + j - 1;
						if (!this.inBounds(tx, ty)) {
							continue;
						}
						const tileIndex = this.getIndex(tx, ty);
						if (checked.has(tileIndex)) {
							continue;
						}
						checked.add(tileIndex);
						let delay = TILE_REVEAL_DELAY * this.size / 10;
						delay = delay - ((delay / 20) / (this.size / 10) * (depth * depth)) - (Math.random() * delay / 10);
						/** Match public/minesweeper: expand when bomb count is 0 even if tile is flagged or already dug (see revealTileInArea). */
						const reveal = (workingBoard: Board): void => {
							const tileCell = workingBoard.cells[tileIndex];
							if (!tileCell.flagged && !tileCell.revealed && !tileCell.hasBomb) {
								tileCell.revealed = true;
								this.particles.emitFromTile(this.tileElements[tileIndex] ?? null, ["sand-a", "sand-b"], 0, 1);
							}
							if (workingBoard.countBombsNear(tx, ty) === 0) {
								revealArea(workingBoard, tx, ty, depth + 1);
							}
						};
						if (delay <= 0) {
							reveal(active);
						} else {
							const timeoutId = window.setTimeout(() => {
								const current = this.store.board.clone();
								reveal(current);
								this.checkWinState();
								this.store.board = current;
							}, delay);
							this.revealTimeouts.push(timeoutId);
						}
					}
				}
			};
			revealArea(nextBoard, xPos, yPos, 0);
		}

		this.checkWinState();
		this.store.board = nextBoard;
	}

	toggleFlag(index: number, tile?: HTMLButtonElement | null): void {
		if (this.store.gameState !== "playing") {
			return;
		}

		const previousBoard = this.store.board;
		let nextBoard: Board;
		if (!this.store.generatedBombs) {
			nextBoard = this.applyBombPlacement(index, previousBoard);
			this.store.generatedBombs = true;
		} else {
			nextBoard = previousBoard.clone();
		}
		const cell = nextBoard.cells[index];
		if (cell.revealed) {
			this.store.board = nextBoard;
			return;
		}

		const currentFlags = previousBoard.countFlagged();
		if (!cell.flagged && currentFlags >= this.bombCount) {
			this.store.board = nextBoard;
			return;
		}

		cell.flagged = !cell.flagged;
		if (cell.flagged) {
			this.particles.emitFromTile(tile ?? this.tileElements[index] ?? null, ["red"], 1, 2);
			if (cell.hasBomb) {
				this.correctFlagsCount += 1;
			}
		} else if (cell.hasBomb) {
			this.correctFlagsCount -= 1;
		}
		this.checkWinState();
		this.store.board = nextBoard;
	}

	private applyBombPlacement(initialIndex: number, board: Board): Board {
		const { board: nextBoard, bombIndices } = board.placeBombs(this.bombCount, initialIndex);
		this.bombIndices = bombIndices;
		return nextBoard;
	}

	private checkWinState(): void {
		if (this.correctFlagsCount === this.bombCount) {
			this.store.gameState = "won";
			this.stopTimer();
		}
	}

	private endGameWithLoss(nextBoard: Board): Board {
		this.store.gameState = "lost";
		this.stopTimer();
		this.clearRevealTimeouts();
		window.setTimeout(() => {
			let initialDelay = 500;
			let delay = initialDelay;
			let previousDelay = 0;

			for (let i = 0; i < this.bombIndices.length; i++) {
				const bombIndex = this.bombIndices[i];
				delay = initialDelay - i * i;
				if (delay < 10) {
					delay = 10;
				}
				delay += previousDelay;
				previousDelay = delay;

				const timeoutId = window.setTimeout(() => {
					const board = this.store.board.clone();
					const bombCell = board.cells[bombIndex];
					if (!bombCell.flagged) {
						bombCell.revealed = true;
						this.particles.emitFromTile(this.tileElements[bombIndex] ?? null, ["background-color-b", "background-color-c"], 0, 1);
					}
					this.store.board = board;
				}, delay);
				this.revealTimeouts.push(timeoutId);
			}
		}, 150);
		return nextBoard;
	}

	private inBounds(x: number, y: number): boolean {
		return x >= 0 && x < this.size && y >= 0 && y < this.size;
	}

	private getIndex(x: number, y: number): number {
		return y * this.size + x;
	}

	private clearRevealTimeouts(): void {
		for (const id of this.revealTimeouts) {
			window.clearTimeout(id);
		}
		this.revealTimeouts = [];
	}

	private stopTimer(): void {
		if (this.timerInterval != null) {
			window.clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
	}

	private startTimer(): void {
		this.stopTimer();
		if (this.store.gameState !== "playing") {
			return;
		}
		const start = Date.now();
		const sessionId = this.store.gameId;
		this.timerInterval = window.setInterval(() => {
			if (this.store.gameId !== sessionId || this.store.gameState !== "playing") {
				this.stopTimer();
				return;
			}
			const delta = Date.now() - start;
			this.store.seconds = Math.min(Math.floor(delta / 1000), 999);
		}, 100);
	}
}
