# Sync2

The next generation VeChain wallet for all platforms.

## What's New

Compared to Sync v1, the most significant change is that the built-in dApp browser is abandoned. That means now dApps can freely run in your favorite web browser.

## Supported Platforms

| Platform | | Link |
| --- | --- | --- |
| Browser (nightly/unstable) | | https://lite.sync.vecha.in |
| Desktop | | |
| | Windows | [Releases](https://github.com/vechain/sync2/releases/latest) |
| | macOS | [Releases](https://github.com/vechain/sync2/releases/latest) |
| | Linux | [Releases](https://github.com/vechain/sync2/releases/latest) |
| Mobile | | |
| | Android | [Google Play](https://play.google.com/store/apps/details?id=org.vechain.sync2) |
| | iOS | [App Store](https://apps.apple.com/app/6446363029) |

## Port dApps to Sync2

You can easily port your dApp by integrating [Connex v2](https://github.com/vechain/connex).

## Build from source 

### Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

* web mode
    ```bash
    quasar dev
    ```
* electron mode
    ```bash
    quasar dev -m electron
    ```
* ios mode
    ```bash
    quasar dev -m ios
    ```
* android mode
    ```bash
    quasar dev -m android
    ```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
quasar build
```

## Version release flow

<details>
  <summary>Click to get detail</summary>


### Browser

Browser version will be updated automatically by [Action](./.github/workflows/deploy-pwa-preview.yaml)

### Desktop

+ Bump `<version>` in [package.json](./package.json)
+ `git tag v<version>`
+ `git push origin v<version>`
+ Check [Action](./.github/workflows/release.yaml) for more detailed info.
</details>

## License

This package is licensed under the
[GNU Lesser General Public License v3.0](https://www.gnu.org/licenses/lgpl-3.0.html), also included
in *LICENSE* file in the repository.
