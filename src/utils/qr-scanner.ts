import QrScanner from 'qr-scanner'
import QrScannerWorkerPath from '!!file-loader!../../node_modules/qr-scanner/qr-scanner-worker.min.js'

QrScanner.WORKER_PATH = QrScannerWorkerPath

export { QrScanner }
