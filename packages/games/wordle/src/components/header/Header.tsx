import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Header.module.css";
import { faCircleQuestion, faRotateRight } from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
	toggleHelp: Function;
	restartGame: Function;
}

export function Header({ toggleHelp, restartGame }: HeaderProps) {
	return <header className={styles.Header}>
		<span className={`${styles.Menu} ${styles["Menu-left"]}`}>
			<button title="Restart" className={styles["Menu-button"]} onClick={() => { restartGame(); }}>
				<FontAwesomeIcon icon={faRotateRight}/>
			</button>
		</span>
		<h1 className={styles.Title}>Wordle</h1>
		<span className={`${styles.Menu} ${styles["Menu-right"]}`}>
			<button title="Show/Hide Help" className={styles["Menu-button"]} onClick={() => { toggleHelp(); }}>
				<FontAwesomeIcon icon={faCircleQuestion}/>
			</button>
		</span>
	</header>;
}