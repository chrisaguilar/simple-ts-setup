const { cpus } = require('os');
const { join } = require('path');

/**
 * Plugins
 *
 * fork-ts-checker-webpack-plugin => https://npm.im/fork-ts-checker-webpack-plugin
 *      Runs TypeScript type checker on a separate process (to speed up build
 *      times)
 *
 * tsconfig-paths-webpack-plugin => https://npm.im/tsconfig-paths-webpack-plugin
 *      Loads modules whose location is specified in the `paths` section of
 *      tsconfig.json when using webpack.
 *
 * webpack-node-externals => https://npm.im/webpack-node-externals
 *      Prevents modules located in `node_modules` from being bundled by
 *      webpack. This is extremely useful for writing backend apps.
 */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpackNodeExternals = require('webpack-node-externals');

module.exports = function (env, args) {
    return {
        /**
         * The base directory, an *absolute path*, for resolving entry points
         * and loaders from the configuration.
         */
        context: __dirname,
        /**
         * Defines the entry file(s) of your server bundle(s).
         */
        entry: join(__dirname, 'src/server/index.ts'),
        output: {
            /**
             * The name that your server file(s) will have after being built
             */
            filename: 'app.js',
            /**
             * The absolute path to the directory where webpack will put your
             * bundled server code.
             */
            path: join(__dirname)
        },
        module: {
            rules: [
                {
                    /**
                     * Applies the RegEx against each file to be bundled, if
                     * the file matches the RegEx (here, ends with .ts), it
                     * will apply the loaders defined in `use` in reverse
                     * order.
                     */
                    test: /\.ts$/,
                    /**
                     * Tell webpack to only look in the src/server directory
                     * for these files
                     */
                    include: join(__dirname, 'src'),
                    use: [
                        /**
                         * https://npm.im/cache-loader
                         *
                         * Caches the results of the loaders on the disk, helps
                         * speed up compilation.
                         *
                         * Here the cache directory is in
                         * `node_modules/.cache/cache-loader`
                         */
                        {
                            loader: 'cache-loader',
                            options: {
                                cacheDirectory: join(__dirname, 'node_modules/.cache/cache-loader')
                            }
                        },
                        /**
                         * https://npm.im/thread-loader
                         *
                         * Runs expensive (CPU-intensive) loaders in different
                         * threads. Here it will run in # of CPUs - 1 threads.
                         */
                        {
                            loader: 'thread-loader',
                            options: {
                                workers: cpus().length - 1
                            }
                        },
                        /**
                         * https://npm.im/babel-loader
                         *
                         * Transpiles JS down to earlier versions based on the
                         * babel presets provided, here it will transpile the
                         * latest JS down to the current node version running
                         * the webpack build process
                         */
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', { node: 'current' }], '@babel/preset-stage-0']
                            }
                        },
                        /**
                         * https://npm.im/ts-loader
                         *
                         * Converts TypeScript to JavaScript
                         *
                         * The options provided are used to parallelize and
                         * speed up the bundling process in conjunction with
                         * thread-loader and fork-ts-checker-webpack-plugin
                         */
                        {
                            loader: 'ts-loader',
                            options: {
                                happyPackMode: true,
                                transpileOnly: true
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            /**
             * Tell webpack to look for files that end with .ts and .js
             * when importing modules with the `import` keyword.
             *
             * e.g. `import { fooBar } from './baz';` where ./baz ends with .ts
             */
            extensions: ['.js', '.ts'],
            /**
             * See above.
             */
            plugins: [new TsConfigPathsPlugin()]
        },
        /**
         * See above.
         */
        externals: [webpackNodeExternals()],
        /**
         * Tell webpack that this bundle is being compiled for use with Node.js
         */
        target: 'node',
        /**
         * Tell webpack to not rewrite the values of `__dirname` and
         * `__filename`
         */
        node: {
            __dirname: false,
            __filename: false
        },
        plugins: [
            /**
             * See above.
             *
             * Here the plugin will check for syntactic errors and run tslint
             * on each file as it is bundled in with webpack.
             */
            new ForkTsCheckerWebpackPlugin({
                checkSyntacticErrors: true,
                tslint: true
            })
        ]
    };
}
