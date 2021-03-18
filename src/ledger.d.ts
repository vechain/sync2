declare module '@ledgerhq/hw-transport-webhid' {
    import Transport, { Observer, DescriptorEvent, Subscription } from '@types/ledgerhq__hw-transport'

    type DeviceModel = {
        id: DeviceModelId
        productName: string
        productIdMM: number
        legacyUsbProductId: number
        usbOnly: boolean
        memorySize: number
        // blockSize: number, // THIS FIELD IS DEPRECATED, use getBlockSize
        getBlockSize(firmwareVersion: string): number
        bluetoothSpec?: Array<{
            serviceUuid: string
            writeUuid: string
            notifyUuid: string
        }>
    }

    type BluetoothInfos = {
        deviceModel: DeviceModel
        serviceUuid: string
        writeUuid: string
        notifyUuid: string
    }

    type HIDDeviceFilter = {
        vendorId?: number,
        productId?: number,
        usagePage?: number,
        usage?: number
    }

    type HIDDeviceRequestOptions = {
        filters: HIDDeviceFilter[]
    }

    class HIDConnectionEvent extends Event {
        device: HIDDevice
    }

    type HIDConnectionEventHandler = (event: HIDConnectionEvent) => mixed

    class HID extends EventTarget {
        getDevices(): Promise<HIDDevice[]>
        requestDevice(options: HIDDeviceRequestOptions): Promise<HIDDevice>
        addEventListener(name: 'connect', HIDConnectionEventHandler): void
        removeEventListener(name: 'connect', HIDConnectionEventHandler): void
        addEventListener(name: 'disconnect', HIDConnectionEventHandler): void
        removeEventListener(name: 'disconnect', HIDConnectionEventHandler): void
    }

    class InputReportEvent extends Event {
        data: DataView
        device: HIDDevice
        reportId: number
    }

    type InputReportEventHandler = (event: InputReportEvent) => mixed

    class HIDDevice {
        oninputreport: InputReportEventHandler
        opened: boolean
        vendorId: number
        productId: number
        productName: string
        open(): Promise<void>
        close(): Promise<void>
        sendReport(reportId: number, data: BufferSource): Promise<void>
        sendFeatureReport(reportId: number, data: BufferSource): Promise<void>
        receiveFeatureReport(reportId: number): Promise<DataView>
        addEventListener(name: 'inputreport', InputReportEventHandler): void
        removeEventListener(name: 'inputreport', InputReportEventHandler): void
    }
    // }
    export default class TransportWebHID extends Transport<HIDDevice> {
        constructor(device: HIDDevice)
        device: HIDDevice
        deviceModel?: DeviceModel
        channel: number
        packetSize: 64
        inputs: Array<any>
        inputCallback?(Buffer): void
        async read(): Buffer
        onInputReport(e: InputReportEvent)

        async static isSupported(): boolean
        async static list(): HIDDevice[]
        static listen(observer: Observer<DescriptorEvent<HIDDevice>>): Subscription
        async static request(): Transport<HIDDevice>
        async close(): void
        async static openConnected: Transport | null
        async static open(device: HIDDevice): Transport
        async exchange(apdu: Buffer): Buffer

        _disconnectEmitted: false
        _emitDisconnect(e: Error): void
    }

}