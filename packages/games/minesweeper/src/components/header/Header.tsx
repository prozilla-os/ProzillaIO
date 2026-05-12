import React from "react";
import styles from "./Header.module.css";
import difficulties from "../../data/difficulties.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate, faChevronDown, faClock, faFlag } from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
	difficulty: string;
	flags: number;
	seconds: number;
	onRestart: (level?: keyof typeof difficulties) => void;
}

function isDifficultyKey(value: string): value is keyof typeof difficulties {
	return Object.prototype.hasOwnProperty.call(difficulties, value);
}

export function Header({ difficulty, flags, seconds, onRestart }: HeaderProps) {
	const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
		if (isDifficultyKey(event.target.value)) {
			onRestart(event.target.value);
		}
	};

	return (
		<header className={styles.Header}>
			<button 
				className={styles.Reset}
				onClick={() => {
					onRestart();
				}}
			>
				<FontAwesomeIcon icon={faArrowsRotate} className={styles.ResetIcon} />
			</button>
			<label className={styles.Difficulty}>
				<select 
					value={difficulty} 
					onChange={handleDifficultyChange}
				>
					<option value="0">{"Easy"}</option>
					<option value="1">{"Medium"}</option>
					<option value="2">{"Hard"}</option>
				</select>
				<FontAwesomeIcon icon={faChevronDown} className={styles.DifficultyChevron} />
			</label>
			<span className={styles.Counter}>
				<i className={styles.FlagIcon}>
					<FontAwesomeIcon icon={faFlag} className={styles.FlagSvg} />
				</i>
				<p>{flags}</p>
			</span>
			<span className={styles.Counter}>
				<i className={styles.TimerIcon}>
					<FontAwesomeIcon icon={faClock} className={styles.TimerSvg} />
				</i>
				<p>{seconds.toString().padStart(3, "0")}</p>
			</span>
		</header>
	);
}