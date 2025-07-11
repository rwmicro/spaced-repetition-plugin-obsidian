import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import postcss from "esbuild-postcss";

const banner = `/*
SPACED REPETITION PLUGIN BY MICRO
*/
`;

const prod = process.argv[2] === "production";

const buildOptions = {
    banner: {
        js: banner,
    },
    entryPoints: {
        "main": "main.ts",
        "styles": "style.css"
    },
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins
    ],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outdir: ".",
    minify: prod,
    plugins: [postcss()],
    loader: {
        ".tsx": "tsx",
        ".ts": "ts"
    }
};

if (prod) {
    await esbuild.build(buildOptions);
} else {
    const context = await esbuild.context(buildOptions);
    await context.watch();
}