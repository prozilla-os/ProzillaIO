import { Canvas } from "./canvas/Canvas";
import { Help } from "./help/Help";
import styles from "./Overlay.module.css";
import { Popup } from "./popup/Popup";

interface OverlayProps {
	toggleHelp: Function;
}

export function Overlay({ toggleHelp }: OverlayProps) {
	return <aside>
		<div className={styles.Overlay}>
			<Popup/>
			<Help toggleHelp={toggleHelp}/>
		</div>
		<Canvas/>
	</aside>;
}