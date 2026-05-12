import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WindowProps } from "@prozilla-os/core";
import { Header } from "./header/Header";
import { GameGrid } from "./grid/GameGrid";
import difficulties from "../data/difficulties.json";
import styles from "./Minesweeper.module.css";

type DifficultyKey = keyof typeof difficulties;
type GameState = "playing" | "won" | "lost";

interface CellState {
	hasBomb: boolean;
	revealed: boolean;
	flagged: boolean;
	adjacentBombs: number;
}

const DEFAULT_DIFFICULTY: DifficultyKey = "1";
const TILE_REVEAL_DELAY = 100;
const SPEED_MULTIPLIER = 0.1;
const PARTICLE_LIFETIME = 3000;
const GRAVITY = 0.05;
const TERMINAL_VELOCITY = 15;

function createEmptyBoard(size: number): CellState[] {
	return Array.from({ length: size * size }, () => ({
		hasBomb: false,
		revealed: false,
		flagged: false,
		adjacentBombs: 0
	}));
}

export function Minesweeper({}: WindowProps) {
	const [difficultyKey, setDifficultyKey] = useState<DifficultyKey>(DEFAULT_DIFFICULTY);
	const [board, setBoard] = useState<CellState[]>(() => createEmptyBoard(difficulties[DEFAULT_DIFFICULTY].size));
	const [seconds, setSeconds] = useState<number>(0);
	const [gameState, setGameState] = useState<GameState>("playing");
	const [generatedBombs, setGeneratedBombs] = useState<boolean>(false);
	const [gameId, setGameId] = useState<number>(0);
	const paletteRef = useRef<HTMLDivElement | null>(null);
	const revealTimeoutsRef = useRef<number[]>([]);
	const tileElementsRef = useRef<Array<HTMLButtonElement | null>>([]);
	const bombIndicesRef = useRef<number[]>([]);
	const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const particleAnimationFrameRef = useRef<number | null>(null);
	const particleRenderStartRef = useRef<number | undefined>(undefined);
	const particlePreviousRenderTimestampRef = useRef<number>(0);
	const tileScaleRef = useRef<number>(0);
	const correctFlagsCountRef = useRef<number>(0);
	const initTileParticlesRef = useRef<(tile: HTMLButtonElement | null, colors: string[], min: number, max: number) => void>(() => {});

	const config = difficulties[difficultyKey];
	const size = config.size;
	const bombCount = config.bombs;

	const resetGame = useCallback((level: DifficultyKey = difficultyKey): void => {
		for (const timeoutId of revealTimeoutsRef.current) {
			window.clearTimeout(timeoutId);
		}
		revealTimeoutsRef.current = [];
		setDifficultyKey(level);
		setBoard(createEmptyBoard(difficulties[level].size));
		setSeconds(0);
		setGameState("playing");
		setGeneratedBombs(false);
		setGameId((current) => current + 1);
		correctFlagsCountRef.current = 0;
		bombIndicesRef.current = [];
	}, [difficultyKey]);

	useEffect(() => {
		return () => {
			for (const timeoutId of revealTimeoutsRef.current) {
				window.clearTimeout(timeoutId);
			}
			revealTimeoutsRef.current = [];
			if (particleAnimationFrameRef.current !== null) {
				window.cancelAnimationFrame(particleAnimationFrameRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (gameState !== "playing") {
			return;
		}

		const start = Date.now();
		const timerInterval = window.setInterval(() => {
			const delta = Date.now() - start;
			const secondsNow = Math.floor(delta / 1000);
			setSeconds(Math.min(secondsNow, 999));
		}, 100);

		return () => {
			window.clearInterval(timerInterval);
		};
	}, [gameId, gameState]);

	const inBounds = useCallback((x: number, y: number): boolean => {
		return x >= 0 && x < size && y >= 0 && y < size;
	}, [size]);

	const getIndex = useCallback((x: number, y: number): number => {
		return y * size + x;
	}, [size]);

	const getNeighbors = useCallback((x: number, y: number): number[] => {
		const neighbors: number[] = [];
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				if (dx === 0 && dy === 0) {
					continue;
				}
				const nx = x + dx;
				const ny = y + dy;
				if (inBounds(nx, ny)) {
					neighbors.push(getIndex(nx, ny));
				}
			}
		}
		return neighbors;
	}, [getIndex, inBounds]);

	const placeBombs = useCallback((initialIndex: number, cells: CellState[]): CellState[] => {
		const nextBoard = cells.map((cell) => ({ ...cell }));
		const initialX = initialIndex % size;
		const initialY = Math.floor(initialIndex / size);
		const bombIndices: number[] = [];

		let placed = 0;
		while (placed < bombCount) {
			const randomIndex = Math.floor(Math.random() * nextBoard.length);
			const randomX = randomIndex % size;
			const randomY = Math.floor(randomIndex / size);
			const blockedByOriginalRule =
				(randomX >= initialX - 1 && randomX <= initialX + 1)
				|| (randomY >= initialY - 1 && randomY <= initialY + 1);
			if (blockedByOriginalRule || nextBoard[randomIndex].hasBomb) {
				continue;
			}
			nextBoard[randomIndex].hasBomb = true;
			bombIndices.push(randomIndex);
			placed++;
		}
		bombIndicesRef.current = bombIndices;

		for (let index = 0; index < nextBoard.length; index++) {
			if (nextBoard[index].hasBomb) {
				continue;
			}
			const x = index % size;
			const y = Math.floor(index / size);
			nextBoard[index].adjacentBombs = getNeighbors(x, y).reduce((total, neighborIndex) => {
				return total + (nextBoard[neighborIndex].hasBomb ? 1 : 0);
			}, 0);
		}

		return nextBoard;
	}, [bombCount, getNeighbors, size]);

	const hasBomb = useCallback((cells: CellState[], x: number, y: number): boolean => {
		if (!inBounds(x, y)) {
			return false;
		}
		return cells[getIndex(x, y)].hasBomb;
	}, [getIndex, inBounds]);

	const getTileNumber = useCallback((cells: CellState[], xPos: number, yPos: number): number => {
		let bombsNearTile = 0;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				const x = xPos + i - 1;
				const y = yPos + j - 1;
				if (hasBomb(cells, x, y)) {
					bombsNearTile++;
				}
			}
		}
		return bombsNearTile;
	}, [hasBomb]);

	const endGameWithLoss = useCallback((cells: CellState[]): CellState[] => {
		setGameState("lost");
		for (const timeoutId of revealTimeoutsRef.current) {
			window.clearTimeout(timeoutId);
		}
		revealTimeoutsRef.current = [];
		window.setTimeout(() => {
			let initialDelay = 500;
			let delay = initialDelay;
			let previousDelay = 0;

			for (let i = 0; i < bombIndicesRef.current.length; i++) {
				const bombIndex = bombIndicesRef.current[i];
				delay = initialDelay - i * i;
				if (delay < 10) {
					delay = 10;
				}
				delay += previousDelay;
				previousDelay = delay;

				const timeoutId = window.setTimeout(() => {
					setBoard((current) => {
						const next = current.map((entry) => ({ ...entry }));
						const cell = next[bombIndex];
						if (!cell.flagged) {
							cell.revealed = true;
							initTileParticlesRef.current(tileElementsRef.current[bombIndex], ["background-color-b", "background-color-c"], 0, 1);
						}
						return next;
					});
				}, delay);
				revealTimeoutsRef.current.push(timeoutId);
			}
		}, 150);
		return cells;
	}, []);

	const checkWinState = useCallback((cells: CellState[]): void => {
		if (correctFlagsCountRef.current === bombCount) {
			setGameState("won");
		}
	}, [bombCount]);

	const randomRange = (min: number, max: number): number => Math.random() * (max - min) + min;
	const randomRangeInt = (min: number, max: number): number => {
		const lower = Math.ceil(min);
		const upper = Math.floor(max);
		return Math.floor(Math.random() * (upper - lower + 1)) + lower;
	};

	const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: Number.parseInt(result[1], 16),
			g: Number.parseInt(result[2], 16),
			b: Number.parseInt(result[3], 16)
		} : null;
	};

	const particlesRef = useRef<Array<{
		color: { r: number; g: number; b: number };
		dimensions: { x: number; y: number };
		scale: { x: number; y: number };
		position: { x: number; y: number };
		rotation: number;
		velocity: { x: number; y: number };
		birth?: number;
		age?: number;
		opacity?: number;
	}>>([]);

	const initParticle = useCallback((colorName: string, x: number, y: number): void => {
		const colorRoot = paletteRef.current ?? document.documentElement;
		const rootStyle = getComputedStyle(colorRoot);
		const hex = rootStyle.getPropertyValue(`--${colorName}`).trim();
		const color = hexToRgb(hex);
		if (color == null) {
			return;
		}

		particlesRef.current.push({
			color,
			dimensions: {
				x: 15 * tileScaleRef.current / 65,
				y: 15 * tileScaleRef.current / 65
			},
			scale: { x: 1, y: 1 },
			position: { x, y },
			rotation: randomRange(0, 2 * Math.PI),
			velocity: {
				x: randomRange(-1, 1),
				y: randomRange(-2, 0)
			}
		});
	}, []);

	const initTileParticles = useCallback((tile: HTMLButtonElement | null, colors: string[], min: number, max: number): void => {
		if (tile == null || Math.random() < 0.5) {
			return;
		}
		const rect = tile.getBoundingClientRect();
		for (let i = 0; i < randomRangeInt(min, max); i++) {
			const color = colors[Math.floor(Math.random() * colors.length)];
			initParticle(color, randomRange(rect.left, rect.right), randomRange(rect.top, rect.bottom));
		}
	}, [initParticle]);
	initTileParticlesRef.current = initTileParticles;

	useEffect(() => {
		const canvas = particleCanvasRef.current;
		if (canvas == null) {
			return;
		}
		const context = canvas.getContext("2d");
		if (context == null) {
			return;
		}

		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		const render = (timestamp: number) => {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.filter = "contrast(75%)";
			if (particleRenderStartRef.current == null) {
				particleRenderStartRef.current = timestamp;
			}

			if (particlePreviousRenderTimestampRef.current === 0) {
				particlePreviousRenderTimestampRef.current = timestamp;
			}
			const deltaTime = (timestamp - particlePreviousRenderTimestampRef.current) * SPEED_MULTIPLIER;
			particlePreviousRenderTimestampRef.current = timestamp;
			const totalTime = timestamp - particleRenderStartRef.current;

			particlesRef.current.forEach((particle, index) => {
				const width = particle.dimensions.x * particle.scale.x;
				const height = particle.dimensions.y * particle.scale.y;
				if (particle.birth == null) {
					particle.birth = totalTime;
				}
				particle.age = totalTime - particle.birth;
				particle.opacity = 1 - particle.age / PARTICLE_LIFETIME;

				context.translate(particle.position.x, particle.position.y);
				context.rotate(particle.rotation);
				particle.velocity.y = Math.min(particle.velocity.y + GRAVITY * deltaTime, TERMINAL_VELOCITY * deltaTime);
				particle.position.x += particle.velocity.x;
				particle.position.y += particle.velocity.y;

				if (particle.position.y >= canvas.height || particle.position.x < 0 || particle.position.x >= canvas.width || particle.age > PARTICLE_LIFETIME) {
					particlesRef.current.splice(index, 1);
				}

				context.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity})`;
				context.fillRect(-width / 2, -height / 2, width, height);
				context.setTransform(1, 0, 0, 1, 0, 0);
			});

			particleAnimationFrameRef.current = window.requestAnimationFrame(render);
		};

		particleAnimationFrameRef.current = window.requestAnimationFrame(render);
		return () => {
			window.removeEventListener("resize", resizeCanvas);
			if (particleAnimationFrameRef.current != null) {
				window.cancelAnimationFrame(particleAnimationFrameRef.current);
			}
		};
	}, []);

	const revealCell = useCallback((index: number, tile?: HTMLButtonElement | null, manualClick = false): void => {
		if (manualClick && gameState !== "playing") {
			return;
		}

		setBoard((previousBoard) => {
			let nextBoard = previousBoard;
			if (!generatedBombs) {
				nextBoard = placeBombs(index, previousBoard);
				setGeneratedBombs(true);
			} else {
				nextBoard = previousBoard.map((cell) => ({ ...cell }));
			}

			const cell = nextBoard[index];
			if (cell.revealed) {
				return nextBoard;
			}
			if (cell.flagged && gameState === "playing") {
				cell.flagged = false;
				if (cell.hasBomb) {
					correctFlagsCountRef.current -= 1;
				}
				return nextBoard;
			}

			cell.revealed = true;
			if (cell.hasBomb) {
				initTileParticles(tile ?? tileElementsRef.current[index], ["background-color-b", "background-color-c"], 0, 1);
				if (gameState === "playing") {
					return endGameWithLoss(nextBoard);
				}
				return nextBoard;
			}
			initTileParticles(tile ?? tileElementsRef.current[index], ["sand-a", "sand-b"], 0, 1);

			const xPos = index % size;
			const yPos = Math.floor(index / size);
			const bombsNearTile = getTileNumber(nextBoard, xPos, yPos);
			if (bombsNearTile === 0 && manualClick) {
				const checked = new Set<number>();
				const revealArea = (x: number, y: number, depth: number) => {
					if (getTileNumber(nextBoard, x, y) !== 0) {
						return;
					}
					for (let i = 0; i < 3; i++) {
						for (let j = 0; j < 3; j++) {
							const tx = x + i - 1;
							const ty = y + j - 1;
							if (!inBounds(tx, ty)) {
								continue;
							}
							const tileIndex = getIndex(tx, ty);
							if (checked.has(tileIndex)) {
								continue;
							}
							checked.add(tileIndex);
							let delay = TILE_REVEAL_DELAY * size / 10;
							delay = delay - ((delay / 20) / (size / 10) * (depth * depth)) - (Math.random() * delay / 10);
							const reveal = (cells: CellState[]) => {
								const tileCell = cells[tileIndex];
								if (!tileCell.flagged && !tileCell.revealed && !tileCell.hasBomb) {
									tileCell.revealed = true;
									initTileParticles(tileElementsRef.current[tileIndex], ["sand-a", "sand-b"], 0, 1);
									if (getTileNumber(cells, tx, ty) === 0) {
										revealArea(tx, ty, depth + 1);
									}
								}
							};
							if (delay <= 0) {
								reveal(nextBoard);
							} else {
								const timeoutId = window.setTimeout(() => {
									setBoard((current) => {
										nextBoard = current.map((entry) => ({ ...entry }));
										reveal(nextBoard);
										checkWinState(nextBoard);
										return nextBoard;
									});
								}, delay);
								revealTimeoutsRef.current.push(timeoutId);
							}
						}
					}
				};
				revealArea(xPos, yPos, 0);
			}

			checkWinState(nextBoard);
			return nextBoard;
		});
	}, [checkWinState, endGameWithLoss, gameState, generatedBombs, getIndex, getTileNumber, inBounds, initTileParticles, placeBombs, size]);

	const toggleFlag = useCallback((index: number, tile?: HTMLButtonElement | null): void => {
		if (gameState !== "playing") {
			return;
		}

		setBoard((previousBoard) => {
			let nextBoard = previousBoard;
			if (!generatedBombs) {
				nextBoard = placeBombs(index, previousBoard);
				setGeneratedBombs(true);
			} else {
				nextBoard = previousBoard.map((cell) => ({ ...cell }));
			}
			const cell = nextBoard[index];
			if (cell.revealed) {
				return nextBoard;
			}

			const currentFlags = previousBoard.filter((entry) => entry.flagged).length;
			if (!cell.flagged && currentFlags >= bombCount) {
				return nextBoard;
			}

			cell.flagged = !cell.flagged;
			if (cell.flagged) {
				initTileParticles(tile ?? tileElementsRef.current[index], ["red"], 1, 2);
				if (cell.hasBomb) {
					correctFlagsCountRef.current += 1;
				}
			} else if (cell.hasBomb) {
				correctFlagsCountRef.current -= 1;
			}
			checkWinState(nextBoard);
			return nextBoard;
		});
	}, [bombCount, checkWinState, gameState, generatedBombs, initTileParticles, placeBombs]);

	const flags = useMemo(() => {
		const usedFlags = board.filter((cell) => cell.flagged).length;
		return Math.max(bombCount - usedFlags, 0);
	}, [board, bombCount]);

	return <div className={styles.Palette} ref={paletteRef}>
		<canvas ref={particleCanvasRef} className={styles.ParticlesCanvas}/>
		<Header 
			difficulty={difficultyKey} 
			flags={flags} 
			seconds={seconds} 
			onRestart={resetGame}
		/>
		<GameGrid
			board={board}
			size={size}
			onReveal={(index, tile, manualClick) => {
				tileScaleRef.current = tile.getBoundingClientRect().width;
				revealCell(index, tile, manualClick ?? false);
			}}
			onToggleFlag={(index, tile) => {
				tileScaleRef.current = tile.getBoundingClientRect().width;
				toggleFlag(index, tile);
			}}
			onRegisterTile={(index, tile) => {
				tileElementsRef.current[index] = tile;
			}}
		/>
	</div>;
}
