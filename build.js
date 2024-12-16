const esbuild = require("esbuild");
const sveltePlugin = require("esbuild-svelte");
const importGlobPlugin = require("esbuild-plugin-import-glob").default;
const { glsl } = require("esbuild-plugin-glsl");
const { sveltePreprocess } = require("svelte-preprocess");

const args = process.argv.slice(2);
const watch = args.includes("--watch");
const deploy = args.includes("--deploy");
console.log(args);

let clientConditions = ["svelte", "browser"];

if (!deploy) {
  clientConditions.push("development");
}

let optsClient = {
  entryPoints: ["script.js"],
  bundle: true,
  minify: deploy,
  conditions: clientConditions,
  alias: { svelte: "svelte" },
  outdir: "build/",
  logLevel: "info",
  sourcemap: watch ? "inline" : false,
  tsconfig: "./tsconfig.json",
  plugins: [
    importGlobPlugin(),
    sveltePlugin({
      preprocess: sveltePreprocess({
        preserveComments: false,
        compilerOptions: {
          removeComments: true,
        },
      }),
      compilerOptions: { dev: !deploy, css: "injected", generate: "client" },
    }),

    glsl({
      minify: true,
    }),
  ],
};

if (watch) {
  esbuild
    .context(optsClient)
    .then((ctx) => ctx.watch())
    .catch((_error) => process.exit(1));
} else {
  esbuild.build(optsClient);
}
