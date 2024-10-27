import { VirtualDriveConfig, VirtualFolder } from "@prozilla-os/core";
import { appsConfig } from "./apps.config";

export const virtualDriveConfig = new VirtualDriveConfig({
	defaultData: {
		includeDesktopFolder: false,
		includeDocumentsFolder: false,
		includePicturesFolder: false,
		includeSourceTree: false,
		loadData: (virtualRoot) => {
			const userFolder = virtualRoot.navigate("~") as VirtualFolder;

			userFolder.createFolder("Desktop", (desktopFolder) => {
				appsConfig.apps.forEach((app) => {
					desktopFolder.createFile(app.name, undefined, (file) => {
						file.setSource("app://" + app.id)
							.setIconUrl(app.iconUrl);
					});
				});
			})
		}
	}
});