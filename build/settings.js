import esbuildPluginTsc from 'esbuild-plugin-tsc';

export function createBuildSettings(options) {
  return {
    entryPoints: ['src/index.ts'],
    outfile: 'dist/bundle.js',
    platform: 'node',
    bundle: true,
    plugins: [
      esbuildPluginTsc({
        force: true
      }),
    ],
    ...options
  };
}