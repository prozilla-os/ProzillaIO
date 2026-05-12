export interface CellState {
	hasBomb: boolean;
	revealed: boolean;
	flagged: boolean;
	adjacentBombs: number;
}

/** Grid data as consumed by UI (includes valtio snapshots of {@link Board}). */
export interface BoardView {
	readonly size: number;
	readonly cells: ReadonlyArray<CellState>;
}

export class Board {
	readonly size: number;
	readonly cells: CellState[];

	constructor(size: number, cells?: CellState[]) {
		this.size = size;
		this.cells = cells ?? Board.emptyCells(size);
	}

	clone(): Board {
		return new Board(this.size, this.cells.map((cell) => ({ ...cell })));
	}

	countFlagged(): number {
		return Board.countFlagged(this.cells);
	}

	private hasBombAt(x: number, y: number): boolean {
		if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
			return false;
		}
		return this.cells[y * this.size + x].hasBomb;
	}

	/** Counts bombs in the 3x3 region around (xPos, yPos), matching original game logic. */
	countBombsNear(xPos: number, yPos: number): number {
		let bombsNearTile = 0;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				const x = xPos + i - 1;
				const y = yPos + j - 1;
				if (this.hasBombAt(x, y)) {
					bombsNearTile++;
				}
			}
		}
		return bombsNearTile;
	}

	placeBombs(bombCount: number, initialIndex: number): { board: Board; bombIndices: number[] } {
		const nextCells = this.cells.map((cell) => ({ ...cell }));
		const initialX = initialIndex % this.size;
		const initialY = Math.floor(initialIndex / this.size);
		const bombIndices: number[] = [];

		let placed = 0;
		while (placed < bombCount) {
			const randomIndex = Math.floor(Math.random() * nextCells.length);
			const randomX = randomIndex % this.size;
			const randomY = Math.floor(randomIndex / this.size);
			const blockedByOriginalRule =
				(randomX >= initialX - 1 && randomX <= initialX + 1)
				|| (randomY >= initialY - 1 && randomY <= initialY + 1);
			if (blockedByOriginalRule || nextCells[randomIndex].hasBomb) {
				continue;
			}
			nextCells[randomIndex].hasBomb = true;
			bombIndices.push(randomIndex);
			placed++;
		}

		for (let index = 0; index < nextCells.length; index++) {
			if (nextCells[index].hasBomb) {
				continue;
			}
			const x = index % this.size;
			const y = Math.floor(index / this.size);
			nextCells[index].adjacentBombs = Board.collectNeighborIndices(x, y, this.size).reduce((total, neighborIndex) => {
				return total + (nextCells[neighborIndex].hasBomb ? 1 : 0);
			}, 0);
		}

		return { board: new Board(this.size, nextCells), bombIndices };
	}

	/** Grid with no bombs and every cell in its default hidden state. */
	static empty(size: number): Board {
		return new Board(size);
	}

	static countFlagged(cells: ReadonlyArray<CellState>): number {
		return cells.filter((cell) => cell.flagged).length;
	}

	private static emptyCells(size: number): CellState[] {
		return Array.from({ length: size * size }, () => ({
			hasBomb: false,
			revealed: false,
			flagged: false,
			adjacentBombs: 0
		}));
	}

	private static collectNeighborIndices(x: number, y: number, size: number): number[] {
		const neighbors: number[] = [];
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if (dx === 0 && dy === 0) {
					continue;
				}
				const nx = x + dx;
				const ny = y + dy;
				if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
					neighbors.push(ny * size + nx);
				}
			}
		}
		return neighbors;
	}
}
