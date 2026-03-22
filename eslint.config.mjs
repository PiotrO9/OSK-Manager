import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default withNuxt(eslintConfigPrettier, {
    plugins: {
        prettier: eslintPluginPrettier,
    },
    rules: {
        indent: 'off',
        'vue/html-indent': 'off',
        'vue/script-indent': 'off',
        'vue/html-closing-bracket-newline': 'off',
        'vue/multi-word-component-names': 'off',
        'prettier/prettier': [
            'error',
            {
                tabWidth: 4,
                useTabs: false,
                singleQuote: true,
                semi: true,
            },
        ],
        'padding-line-between-statements': [
            'error',
            {
                blankLine: 'always',
                prev: ['const', 'let', 'var'],
                next: '*',
            },
            {
                blankLine: 'any',
                prev: ['const', 'let', 'var'],
                next: ['const', 'let', 'var'],
            },
            {
                blankLine: 'always',
                prev: '*',
                next: 'return',
            },
            {
                blankLine: 'always',
                prev: 'block-like',
                next: '*',
            },
            {
                blankLine: 'always',
                prev: '*',
                next: ['if', 'for', 'while', 'switch', 'try'],
            },
            {
                blankLine: 'always',
                prev: ['if', 'for', 'while', 'switch', 'try'],
                next: '*',
            },
        ],
        'no-multiple-empty-lines': [
            'error',
            {
                max: 2,
                maxEOF: 1,
                maxBOF: 0,
            },
        ],
        'keyword-spacing': [
            'error',
            {
                before: true,
                after: true,
            },
        ],
        'vue/define-macros-order': [
            'error',
            {
                order: [
                    'defineOptions',
                    'defineProps',
                    'defineEmits',
                    'defineSlots',
                ],
            },
        ],
        'vue/component-name-in-template-casing': [
            'error',
            'PascalCase',
            {
                registeredComponentsOnly: false,
            },
        ],
        'vue/block-order': [
            'error',
            {
                order: ['script', 'template', 'style'],
            },
        ],

        'vue/v-bind-style': ['error', 'shorthand'],
        'vue/v-on-style': ['error', 'shorthand'],
        'vue/v-slot-style': ['error', 'shorthand'],

        'vue/component-definition-name-casing': ['error', 'PascalCase'],
        'vue/prop-name-casing': ['error', 'camelCase'],
        'vue/attribute-hyphenation': ['error', 'always'],

        'vue/require-v-for-key': 'error',
        'vue/no-duplicate-attributes': 'error',
        'vue/no-use-v-if-with-v-for': 'error',
        'vue/html-self-closing': [
            'error',
            {
                html: {
                    void: 'always',
                    normal: 'always',
                    component: 'always',
                },
                svg: 'always',
                math: 'always',
            },
        ],
        'vue/html-quotes': ['error', 'double'],
        'vue/v-on-event-hyphenation': ['error', 'always'],

        'vue/define-props-declaration': ['error', 'type-based'],
        'vue/define-emits-declaration': ['error', 'type-based'],
        'vue/no-mutating-props': 'error',

        '@typescript-eslint/prefer-as-const': 'error',
        '@typescript-eslint/consistent-type-definitions': [
            'error',
            'interface',
        ],
        '@typescript-eslint/no-explicit-any': 'warn',

        'prefer-const': 'error',
        'prefer-template': 'error',
        'prefer-arrow-callback': 'error',
        'no-else-return': 'warn',

        'comma-dangle': ['error', 'always-multiline'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'computed-property-spacing': ['error', 'never'],
        'space-before-blocks': 'error',
        'space-infix-ops': 'error',
        'eol-last': ['error', 'always'],
        'no-trailing-spaces': 'error',
    },
});
