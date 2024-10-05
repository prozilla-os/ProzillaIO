import { useEffect, useRef, useState } from "react";
import styles from "./Popup.module.css";
import { POPUP_DURATION } from "../../../config/timing";
import { useClassNames } from "@prozilla-os/core";

interface PopupProps {
	text: string | null;
}

export function Popup({ text }: PopupProps) {
	const [active, setActive] = useState(false);
	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (text == null) {
			setActive(false);
			return;
		}

		if (timeout.current != null) {
			clearTimeout(timeout.current);
			timeout.current = null;
		}

		setActive(true);
		timeout.current = setTimeout(() => {
			setActive(false);
		}, POPUP_DURATION);
	}, [text]);

	const classNames = [styles.Popup];

	if (active)
		classNames.push(styles.Active);

	return <p className={useClassNames(classNames)}>
		{text}
	</p>;
}