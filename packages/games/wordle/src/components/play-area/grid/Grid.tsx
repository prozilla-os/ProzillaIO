import { PropsWithChildren } from "react";
import styles from "./Grid.module.css";

export function Grid({ children }: PropsWithChildren) {
	return <div className={styles.Grid}>
		{children}
	</div>;
}