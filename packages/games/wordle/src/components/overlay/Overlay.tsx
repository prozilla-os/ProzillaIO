import { Canvas } from "./canvas/Canvas";
import { Help } from "./help/Help";
import styles from "./Overlay.module.css";
import { Popup } from "./popup/Popup";

interface OverlayProps {
	toggleHelp: Function;
	helpVisible: boolean;
	popup: string | null;
}

export function Overlay({ toggleHelp, helpVisible, popup }: OverlayProps) {
	return <aside>
		<div className={styles.Overlay}>
			<Popup text={popup}/>
			<Help toggleHelp={toggleHelp} helpVisible={helpVisible}/>
		</div>
		<Canvas/>
	</aside>;
}