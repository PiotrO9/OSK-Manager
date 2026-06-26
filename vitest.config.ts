import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

const appDir = fileURLToPath(new URL('./app', import.meta.url));
const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            '~': appDir,
            '@': appDir,
            '~~': rootDir,
            '@@': rootDir,
        },
    },
});
