import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Header.module.css";
import { faCircleQuestion, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { useGameContext } from "../../hooks/gameContext";

interface HeaderProps {
	toggleHelp: Function;
}

export function Header({ toggleHelp }: HeaderProps) {
	const game = useGameContext();

	return <header>
		<span className={styles["Menu-left"]}>
			<button title="Restart" onClick={() => { game?.restartGame(); }}>
				<FontAwesomeIcon icon={faRotateRight}/>
			</button>
		</span>
		<h1>Wordle</h1>
		<span className={styles["Menu-right"]}>
			<button title="Show/Hide Help" onClick={() => { toggleHelp(); }}>
				<FontAwesomeIcon icon={faCircleQuestion}/>
			</button>
		</span>
	</header>;
}