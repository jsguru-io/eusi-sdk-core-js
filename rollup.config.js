import resolve from 'rollup-plugin-node-resolve';
import strip from 'rollup-plugin-strip';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

const browserBuildPlugins = [
    resolve(),
    commonjs(),
    babel({
        exclude: ['node_modules/**'],
        plugins: ['external-helpers']
    }),
    strip({
        debugger: true,
        functions: ['console.log', 'assert.*', 'debug', 'alert']
    })
];

const input = 'lib/index.js';

export default [
    // browser-friendly UMD build
    {
        input,
        plugins: browserBuildPlugins,
        output: {
            name: 'eusiCore',
            file: pkg.browser,
            format: 'umd',
        }

    },
    {
        input,
        plugins: browserBuildPlugins.concat(uglify()),
        output: {
            file: 'dist/browser/eusi-sdk-core.min.js',
            format: 'umd',
            name: 'eusiCore'
        }
    },
    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // the `targets` option which can specify `dest` and `format`)
    {
        input,
        external: Object.keys(pkg.dependencies || {}),
        output: [
            {
                file: pkg.main, format: 'cjs'
            },
            {
                file: pkg.module, format: 'es'
            }
        ],
        plugins: [
            babel({
                exclude: ['node_modules/**'],
                plugins: ['external-helpers']
            })
        ]
    }
];
