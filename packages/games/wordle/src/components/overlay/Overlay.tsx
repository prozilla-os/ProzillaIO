import Confetti from "./confetti/Confetti";
import { Help } from "./help/Help";
import styles from "./Overlay.module.css";
import { Popup } from "./popup/Popup";

interface OverlayProps {
	toggleHelp: Function;
	helpVisible: boolean;
	popup: string | null;
	won: boolean;
}

export function Overlay({ toggleHelp, helpVisible, popup, won }: OverlayProps) {
	return <aside>
		<div className={styles.Overlay}>
			<Popup text={popup}/>
			<Help toggleHelp={toggleHelp} helpVisible={helpVisible}/>
		</div>
		{won && <Confetti/>}
	</aside>;
}