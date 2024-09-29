import { ReactElement } from "react";
import { NAME, TAG_LINE } from "./config/branding.config";
import { appsConfig } from "./config/apps.config";
import { ProzillaOS, Taskbar, WindowsView, ModalsView, Desktop } from "@prozilla-os/core";

export function Main(): ReactElement {
	return <ProzillaOS
		systemName={NAME}
		tagLine={TAG_LINE}
		config={{
			apps: appsConfig,
		}}
	>
		<Taskbar/>
		<WindowsView/>
		<ModalsView/>
		<Desktop/>
	</ProzillaOS>;
}