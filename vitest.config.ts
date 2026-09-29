import { fileURLToPath, URL } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

const appDir = fileURLToPath(new URL('./app', import.meta.url));
const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, 'e2e/**'],
    },
    resolve: {
        alias: {
            '~': appDir,
            '@': appDir,
            '~~': rootDir,
            '@@': rootDir,
        },
    },
});
