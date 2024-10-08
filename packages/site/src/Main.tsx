import { ReactElement } from "react";
import { NAME, TAG_LINE } from "./config/branding.config";
import { appsConfig } from "./config/apps.config";
import { ProzillaOS } from "@prozilla-os/core";
import { skin } from "./config/skin.config";
import { Router } from "./router/Router";
import "./styles/global.css";

export function Main(): ReactElement {
	return <ProzillaOS
		systemName={NAME}
		tagLine={TAG_LINE}
		config={{
			apps: appsConfig,
		}}
		skin={skin}
	>
		<Router/>
	</ProzillaOS>;
}