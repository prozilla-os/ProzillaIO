import { NAME, TAG_LINE } from "./config/branding.config";
import { appsConfig } from "./config/apps.config";
import { ProzillaOS } from "prozilla-os";
import { skin } from "./config/skin.config";
import { Router } from "./router/Router";
import "./styles/global.css";
import { virtualDriveConfig } from "./config/virtualDrive.config";

export function Main() {
	return <ProzillaOS
		systemName={NAME}
		tagLine={TAG_LINE}
		config={{
			apps: appsConfig,
			virtualDrive: virtualDriveConfig,
		}}
		skin={skin}
	>
		<Router/>
	</ProzillaOS>;
}