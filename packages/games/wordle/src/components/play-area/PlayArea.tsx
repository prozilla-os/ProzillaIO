import { ROW_COUNT } from "../../constants/data";
import { Grid } from "./grid/Grid";
import { Row } from "./grid/row/Row";
import { Keyboard } from "./keyboard/Keyboard";

interface PlayAreaProps {
	isFocused: boolean;
}

export function PlayArea({ isFocused }: PlayAreaProps) {
	const rows = [];
	for (let i = 0; i < ROW_COUNT; i++) {
		rows.push(i);
	}

	return <main>
		<Grid>
			{rows.map((index) =>
				<Row key={index} index={index}/>
			)}
		</Grid>
		<Keyboard isFocused={isFocused}/>
	</main>;
}