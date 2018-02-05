const { cpus } = require('os');
const { join } = require('path');

/**
 * Plugins
 *
 * fork-ts-checker-webpack-plugin => https://npm.im/fork-ts-checker-webpack-plugin
 *      Runs TypeScript type checker on a separate process (to speed up build
 *      times)
 *
 * html-webpack-plugin => https://npm.im/html-webpack-plugin
 *      Generates HTML files based on the configuration options that you give
 *      it
 *
 * tsconfig-paths-webpack-plugin => https://npm.im/tsconfig-paths-webpack-plugin
 *      Loads modules whose location is specified in the `paths` section of
 *      tsconfig.json when using webpack.
 *
 * uglifyjs-webpack-plugin => https://npm.im/uglifyjs-webpack-plugin
 *      Provides code minification
 */
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = function (env, args) {
    const config = {
        /**
         * The base directory, an *absolute path*, for resolving entry points
         * and loaders from the configuration.
         */
        context: __dirname,
        /**
         * Defines the entry file(s) of your client bundle(s).
         */
        entry: join(__dirname, 'src/client/index.ts'),
        output: {
            /**
             * The name that your client file(s) will have after being built
             */
            filename: '[name].js',
            /**
             * The absolute path to the directory where webpack will put your
             * bundled client code.
             */
            path: join(__dirname, 'public/js'),
            /**
             * The path from which your code will be accessed on your server.
             */
            publicPath: '/public/js/'
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
                     * Tell webpack to only look in the src/client directory
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
                                presets: ['@babel/preset-env', '@babel/preset-stage-0']
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
            extensions: [ '.js', '.ts' ],
            /**
             * See above.
             */
            plugins: [ new TsConfigPathsPlugin() ]
        },
        plugins: [
            /**
             * This pulls out all of the modules located in `node_modules`,
             * this separates your code from code that you've installed from
             * NPM
             */
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: (m) => m.context && m.context.includes('node_modules')
            }),
            /**
             * When webpack bundles code it makes a manifest of our code, this
             * extracts that manifest from each of our bundles. If this
             * configuration were better configured, it would help prevent
             * webpack from re-bundling our 'vendor' bundle, and we would be
             * able to implement caching for our assets on our site.
             */
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                minChunks: Infinity
            }),
            /**
             * See above.
             *
             * Here the plugin will check for syntactic errors and run tslint
             * on each file as it is bundled in with webpack.
             */
            new ForkTsCheckerWebpackPlugin({
                checkSyntacticErrors: true,
                tslint: true
            }),
            /**
             * Generates an index.html file in public/views, minifies the file,
             * injects a div with an id of 'app' by default, caches the output.
             */
            new HtmlWebpackPlugin({
                inject: false,
                template: require('html-webpack-template'),
                title: 'Hello, World!',
                filename: join(__dirname, 'public/views/index.html'),
                appMountId: 'app',
                cache: true,
                minify: {
                    caseSensitive: true,
                    collapseBooleanAttributes: true,
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    html5: true,
                    keepClosingSlash: true,
                    removeComments: true,
                    useShortDoctype: true
                }
            })
        ]
    };

    /**
     * This will modify the webpack config when the NODE_ENV is production.
     */
    if (process.env.NODE_ENV === 'production') {
        config.plugins.push(
            /**
             * Minifies the bundle in production mode
             */
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: true
                }
            })
        );
    }

    return config;
}
