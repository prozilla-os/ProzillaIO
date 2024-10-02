import { useEffect, useState } from "react";
import { GameContext } from "../hooks/gameContext";
import { Header } from "./header/Header";
import { Overlay } from "./overlay/Overlay";
import { PlayArea } from "./play-area/PlayArea";
import styles from "./Wordle.module.css";
import { Game } from "../core/game";
import { WindowProps } from "@prozilla-os/core";

export function Wordle({ active }: WindowProps) {
	const [showHelp, setShowHelp] = useState(false);
	const [game, setGame] = useState<Game | null>(null);

	useEffect(() => {
		setGame(new Game());
	}, []);

	const toggleHelp = (show?: boolean) => {
		if (show != null) {
			setShowHelp(show);
		} else {
			setShowHelp((value) => !value);
		}
	};

	return <GameContext.Provider value={game}>
		{game && <div className={styles.Wordle}>
			<Header toggleHelp={toggleHelp}/>
			<PlayArea isFocused={active!}/>
			<Overlay toggleHelp={toggleHelp}/>
		</div>}
	</GameContext.Provider>;
}