import { NAME, TAG_LINE } from "./config/branding.config";
import { appsConfig } from "./config/apps.config";
import { ProzillaOS } from "prozilla-os";
import { skin } from "./config/skin.config";
import { Router } from "./router/Router";
import "./styles/global.css";
import { desktopConfig } from "./config/desktop.config";
import { virtualDriveConfig } from "./config/virtualDrive.config";

export function Main() {
	return <ProzillaOS
		systemName={NAME}
		tagLine={TAG_LINE}
		config={{
			apps: appsConfig,
			desktop: desktopConfig,
			virtualDrive: virtualDriveConfig
		}}
		skin={skin}
	>
		<Router/>
	</ProzillaOS>;
}