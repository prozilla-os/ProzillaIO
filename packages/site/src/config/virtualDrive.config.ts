import { VirtualDriveConfig, VirtualFolder, VirtualRoot } from "prozilla-os";

export const virtualDriveConfig = new VirtualDriveConfig({
	defaultData: {
		loadData: (virtualRoot) => {
			const desktopFolder = virtualRoot.navigate("~/Desktop");
			if (desktopFolder instanceof VirtualFolder) {
				desktopFolder.getSubFolders(true).forEach((folder) => folder.delete());
				desktopFolder.getFiles(true).forEach((file) => file.delete());
			} 
		}
	}
});