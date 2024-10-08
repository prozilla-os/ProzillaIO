import { defineConfig } from "vite";
import { appViteConfig } from "@prozilla-os/dev-tools";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig(({ mode }) => {
	const isDevEnv = mode === "development";

	return {
		...appViteConfig(__dirname, "src/main.ts"),
		...{
			plugins: [
				isDevEnv && react(),
				cssInjectedByJsPlugin(),
				dts({
					outDir: "dist",
					rollupTypes: true,
					strictOutput: true,
					pathsToAliases: false,
					tsconfigPath: "tsconfig.build.json"
				})
			],
		}
	};
});