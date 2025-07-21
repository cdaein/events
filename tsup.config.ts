import { defineConfig } from "tsup";
import esbuildPluginLicense from "esbuild-plugin-license";
import packageJson from "./package.json";

const licenseNoticeOpts = {
  banner: `
/*! 
 * <%= pkg.name %> v<%= pkg.version %> | <%= pkg.license %> 
 * Find third-party licenses in LICENSE.txt  
 */
`,
  thirdParty: {
    output: {
      file: "LICENSE.txt",
      template(dependencies: any) {
        return dependencies
          .map(
            (dep: any) =>
              `${dep.packageJson.name}:${dep.packageJson.version} by ${dep.packageJson.author?.name} -- ${dep.packageJson.license} -- ${dep.packageJson.repositoery?.url || dep.packageJson.homepage}`,
          )
          .join("\n");
      },
    },
  },
};

const banner = `/*! ${packageJson.name}@${packageJson.version} by ${packageJson.author} - ${packageJson.license} */`;

export default defineConfig([
  // npm module (no bundling)
  {
    entry: ["./src/index.ts"],
    format: "esm",
    target: "esnext",
    dts: true,
    clean: true,
    treeshake: true,
    esbuildPlugins: [esbuildPluginLicense(licenseNoticeOpts)],
    banner: {
      js: banner,
    },
  },
  // es6 module (bundled)
  {
    entry: {
      index: "./src/index.ts",
    },
    format: ["esm"],
    outDir: "dist",
    bundle: true,
    skipNodeModulesBundle: false,
    target: "esnext",
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: true,
    outExtension() {
      return {
        js: ".esm.js",
      };
    },
    esbuildPlugins: [esbuildPluginLicense(licenseNoticeOpts)],
    // banner: {
    //   js: banner,
    // },
    noExternal: [/./],
  },
]);
