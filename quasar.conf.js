/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const { configure } = require('quasar/wrappers')
const path = require('path')
const { execSync } = require('child_process')

const appVersion = require('./package.json').version
const appBuild = execSync('git --no-pager log -n 1 --date=short --pretty="%ad.%h"')
  .toString('utf8')
  .replace(/-/g, '.')
  .trim()

module.exports = configure(function (/* ctx */) {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/cli-documentation/boot-files
    boot: [
      'i18n',
      'axios',
      'misc',
      'directives',
      'services'
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      'app.sass'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v4',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      // 'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: 'material-icons', // Quasar icon set
      lang: 'en-us', // Quasar language pack
      config: {
        loadingBar: {
            skipHijack: true
        }
      },

      // Possible values for "all":
      // * 'auto' - Auto-import needed Quasar components & directives
      //            (slightly higher compile time; next to minimum bundle size; most convenient)
      // * false  - Manually specify what to import
      //            (fastest compile time; minimum bundle size; most tedious)
      // * true   - Import everything from Quasar
      //            (not treeshaking Quasar; biggest bundle size; convenient)
      all: false,

      components: [
        "QAvatar",
        "QBadge",
        "QBtn",
        "QItem",
        "QItemSection",
        "QItemLabel",
        "QExpansionItem",
        "QImg",
        "QIcon",
        "QToolbar",
        "QToolbarTitle",
        "QList",
        "QResizeObserver",
        "QSeparator",
        "QCard",
        "QCardSection",
        "QCardActions",
        "QPopupProxy",
        "QBanner",
        "QSlideTransition",
        "QResponsive",
        "QDialog",
        "QInput",
        "QForm",
        "QTabPanels",
        "QTabPanel",
        "QToggle",
        "QSpinnerDots",
        "QInfiniteScroll",
        "QChip",
        "QCarousel",
        "QCarouselSlide",
        "QCheckbox"
      ],
      directives: [
        "TouchPan",
        "Intersection",
        "ClosePopup"
      ],

      // Quasar plugins
      plugins: [
          "Dialog",
          "Notify"
      ]
    },

    // https://quasar.dev/quasar-cli/cli-documentation/supporting-ie
    supportIE: false,

    // https://quasar.dev/quasar-cli/cli-documentation/supporting-ts
    supportTS: {
      tsCheckerConfig: { eslint: true }
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      env: {
          APP_VERSION: JSON.stringify(appVersion),
          APP_BUILD: JSON.stringify(appBuild),
          DIST_TAG: JSON.stringify(process.env.DIST_TAG)
      },
      vueRouterMode: 'hash', // available values: 'hash', 'history'

      // rtl: false, // https://quasar.dev/options/rtl-support
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // preloadChunks: false,
      // extractCSS: false,

      modern: true,

      // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
      extendWebpack (cfg) {
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          core: path.resolve(__dirname, './src/core'),
        }
        if (process.env.NODE_ENV === 'production') {
          // linting is slow in TS projects, we execute it only for production builds
          cfg.module.rules.push({
            enforce: 'pre',
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            exclude: /node_modules/,
            options: {
              formatter: require('eslint').CLIEngine.getFormatter('stylish')
            }
          })
        }
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      port: 8080,
      open: true // opens browser window automatically
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: [],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [{
          urlPattern: /^https:\/\/vechain.github.io\/token-registry\/assets\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'token-icons',
            cacheableResponse: {statuses: [0, 200]}
          }
        }]
      }, // only for GenerateSW
      manifest: {
        name: 'Sync2',
        // eslint-disable-next-line @typescript-eslint/camelcase
        short_name: 'Sync2',
        description: 'VeChain Sync2',
        display: 'standalone',
        orientation: 'portrait',
        // eslint-disable-next-line @typescript-eslint/camelcase
        background_color: '#ffffff',
        // eslint-disable-next-line @typescript-eslint/camelcase
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    },
    sourceFiles : {
      electronMainProd: 'src-electron/main-process/electron-main.ts',
      electronMainDev: 'src-electron/main-process/electron-main.dev.ts'
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
      id: 'org.vechain.sync2'
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'builder', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        productName: 'Sync2',
        appId: 'org.vechain.sync2',
        artifactName: '${productName}-${os}-${arch}-${version}.${ext}',
        protocols: {
            name: 'VeChain Connex',
            schemes: ['connex']
        },
        win: {
          target: {
            arch: ['x64', 'arm64'],
            target: 'nsis'
          }
        },
        linux: {
          target: {
            arch: ['x64', 'arm64'],
            target: 'AppImage'
          }
        },
        afterSign: "build/notarize.js",
        mac: {
          entitlements: "build/entitlements.mac.plist",
          entitlementsInherit: "build/entitlements.mac.plist",
          target: {
            arch: ['x64', 'arm64'],
            target: 'dmg'
          }
        }
      },

       // Requires: @quasar/app v1.4.2+
      // Specify additional parameters when yarn/npm installing
      // the UnPackaged folder, right before bundling with either
      // electron packager or electron builder;
      // Example: [ '--ignore-optional', '--some-other-param' ]
      unPackagedInstallParams: [],

      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: true,

      extendWebpack (cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack

        cfg.resolve.extensions.push('.ts')         
        cfg.module.rules.push({
          test: /\.ts$/,
          use :{
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        })
      }
    }
  }
})
