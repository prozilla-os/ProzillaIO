import { VirtualDriveConfig, VirtualFolder } from "@prozilla-os/core";
import { appsConfig } from "./apps.config";
import { skin } from "./skin.config";

export const virtualDriveConfig = new VirtualDriveConfig({
	defaultData: {
		includeDesktopFolder: false,
		includeDocumentsFolder: false,
		includePicturesFolder: false,
		includeSourceTree: false,
		loadData: (virtualRoot) => {
			const userFolder = virtualRoot.navigate("~") as VirtualFolder;

			userFolder.createFolder("Pictures", (picturesFolder) => {
				picturesFolder.createFolder("Wallpapers", (wallpapersFolder) => {
					for (let i = 0; i < skin.wallpapers.length; i++) {
						const source = skin.wallpapers[i];
						wallpapersFolder.createFile(`Wallpaper${i + 1}`, "png", (file) => {
							file.setSource(source);
						});
					}
				});
			});

			userFolder.createFolder("Desktop", (desktopFolder) => {
				appsConfig.apps.forEach((app) => {
					if (!app.showDesktopIcon)
						return;

					desktopFolder.createFile(app.name, undefined, (file) => {
						file.setSource("app://" + app.id)
							.setIconUrl(app.iconUrl);
					});
				});
			});
		}
	}
});