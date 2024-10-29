import { macOsSkin, Skin } from "@prozilla-os/skins";

export const skin = new Skin({
	systemIcon: "assets/logo.svg",
	defaultWallpaper: "https://os.prozilla.dev/assets/wallpapers/vibrant-wallpaper-purple-yellow.png",
	loadStyleSheet: macOsSkin.loadStyleSheet,
});