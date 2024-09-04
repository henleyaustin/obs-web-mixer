export interface AudioInput {
    inputKind: string;
    inputName: string;
    inputUuid: string;
    unversionedInputKind: string;
    inputVolumeMul: number;
    inputVolumeDb: number;
}

export const AUDIOINPUTS: AudioInput[] = [
    {
        inputKind: 'wasapi_output_capture',
        inputName: 'Desktop Audio',
        inputUuid: 'e9809a82-cfed-45cd-bb63-60066fffd3c3',
        unversionedInputKind: 'wasapi_output_capture',
        inputVolumeMul: 1,
        inputVolumeDb: 0
    },
    {
        inputKind: 'wasapi_input_capture',
        inputName: 'Microphone',
        inputUuid: 'b3e5c4b8-1d84-45d2-9f3d-8a6f8e9a5892',
        unversionedInputKind: 'wasapi_input_capture',
        inputVolumeMul: 0.8,
        inputVolumeDb: -5
    },
    {
        inputKind: 'wasapi_output_capture',
        inputName: 'Game Audio',
        inputUuid: '7f7e4c6a-73f1-4e8c-bae3-4a9466c8e7d3',
        unversionedInputKind: 'wasapi_output_capture',
        inputVolumeMul: 0.6,
        inputVolumeDb: -3
    },
    {
        inputKind: 'wasapi_input_capture',
        inputName: 'Voice Chat',
        inputUuid: 'c7cde4a7-82b1-4b56-8776-4df6c5f1e6b2',
        unversionedInputKind: 'wasapi_input_capture',
        inputVolumeMul: 1.2,
        inputVolumeDb: 2
    },
    {
        inputKind: 'wasapi_output_capture',
        inputName: 'Music',
        inputUuid: 'f4b5c8c7-d4f1-4e6a-9394-2b4c5c3e9d81',
        unversionedInputKind: 'wasapi_output_capture',
        inputVolumeMul: 0.7,
        inputVolumeDb: -4
    }
];
