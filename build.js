import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import pckg from "./package.json" assert { type: "json" };
import * as dts from "npm-dts";

const config = {
	entryPoints: ["src/index.ts"],
	bundle: true,
	minify: true,
	sourcemap: true,
	external: Object.keys(pckg.devDependencies).concat(Object.keys(pckg.peerDependencies)),
	plugins: [sassPlugin()],
};
new dts.default.Generator({
	entry: "src/index.ts",
	output: "dist/esm/index.d.ts",
}).generate();

esbuild
	.build({
		...config,
		target: ["node16"],
		tsconfig: "tsconfig.json",
		outfile: "./dist/esm/index.js",
		platform: "neutral",
		format: "esm",
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});

esbuild
	.build({
		...config,
		tsconfig: "tsconfig-cjs.json",
		outfile: "./dist/cjs/index.js",
		platform: "node",
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
