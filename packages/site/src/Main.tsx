import { ReactElement } from "react";
import { NAME, TAG_LINE } from "./config/branding.config";
import { appsConfig } from "./config/apps.config";
import { ProzillaOS, Taskbar, WindowsView, ModalsView, Desktop } from "@prozilla-os/core";
import { skin } from "./config/skin.config";

export function Main(): ReactElement {
	return <ProzillaOS
		systemName={NAME}
		tagLine={TAG_LINE}
		config={{
			apps: appsConfig,
		}}
		skin={skin}
	>
		<Taskbar/>
		<WindowsView/>
		<ModalsView/>
		<Desktop/>
	</ProzillaOS>;
}