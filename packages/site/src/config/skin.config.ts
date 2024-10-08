import { macOsSkin, Skin } from "@prozilla-os/skins";

export const skin = new Skin({
	defaultWallpaper: "https://os.prozilla.dev/assets/wallpapers/vibrant-wallpaper-purple-yellow.png",
	loadStyleSheet: macOsSkin.loadStyleSheet
});