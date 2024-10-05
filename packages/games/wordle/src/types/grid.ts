export type CellType = {
	content: string,
	status: 0 | 1 | 2 | null // 0: Gray, 1: Yellow, 2: Green
};

export type GridType = CellType[][];