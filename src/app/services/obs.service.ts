import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import OBSWebSocket, { EventSubscription } from 'obs-websocket-js';
import { BehaviorSubject } from 'rxjs';
import { AudioInput } from '../../_models/AudioInput';
import { DisconnectDialogComponent } from '../dialogs/reconnect-dialog/disconnect-dialog.component';
import { OBSConnectionDialogComponent } from '../dialogs/obs-connection-dialog/obs-connection-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class OBSService {
    private obs: OBSWebSocket;
    private serverKey = 'SERVER_IP';
    private serverAddress = '';
    private wasConnected = false;

    public connectionStatus$ = new BehaviorSubject<boolean>(false);
    public inputs$ = new BehaviorSubject<AudioInput[]>([]);
    public selectedInputs$ = new BehaviorSubject<AudioInput[]>([]);

    constructor(private dialog: MatDialog) {
        this.obs = new OBSWebSocket();
        this.setupConnectionListeners();
    }

    // Initialize and connect
    initialize(): void {
        const address = sessionStorage.getItem(this.serverKey);
        if (address) {
            this.serverAddress = address;
            this.connect(this.serverAddress);
        } else {
            this.openConnectionDialog();
        }
    }

    // Connect to OBS WebSocket
    async connect(
        url: string,
        password: string = 'Rwqwb1AgBpao7ZjC'
    ): Promise<void> {
        const connectionTimeout = 5000; // 5 seconds
        try {
            await Promise.race([
                this.obs.connect(url, password, {
                    eventSubscriptions: EventSubscription.InputVolumeMeters
                }),
                new Promise((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Connection Timeout')),
                        connectionTimeout
                    )
                )
            ]);
            console.log('Connected to OBS');
            this.connectionStatus$.next(true);
            sessionStorage.setItem(this.serverKey, url);
            this.wasConnected = true;
            this.listenForVolume();
            await this.fetchInputs(); // Fetch inputs after connection
        } catch (error) {
            this.connectionStatus$.next(false);
            console.error('Error connecting to OBS:', error);
            if (this.wasConnected) {
                this.openDisconnectDialog();
            } else {
                this.openConnectionDialog();
            }
        }
    }

    // Disconnect
    disconnect(): void {
        if (this.obs) {
            this.obs.disconnect();
            this.connectionStatus$.next(false);
        }
    }

    // Fetch inputs
    async fetchInputs(): Promise<void> {
        try {
            const response = await this.obs.call('GetInputList');
            const inputs = await this.mapInputsWithVolumes(response.inputs);
            // Initialize inputs with default meter value (0)
            const enrichedInputs = inputs.map((input) => ({
                ...input,
                meter: 0
            }));
            this.inputs$.next(enrichedInputs);
        } catch (error) {
            console.error('Error fetching inputs:', error);
        }
    }

    // Update input volume
    async updateVolume(uuid: string, volume: number): Promise<void> {
        try {
            await this.obs.call('SetInputVolume', {
                inputUuid: uuid,
                inputVolumeMul: volume / 100
            });
            const updatedInputs = this.inputs$.value.map((input) =>
                input.uuid === uuid ? { ...input, volume } : input
            );
            this.inputs$.next(updatedInputs);
        } catch (error) {
            console.error('Error updating volume:', error);
        }
    }

    // Map inputs with volumes
    private async mapInputsWithVolumes(inputs: any[]): Promise<AudioInput[]> {
        const promises = inputs.map(async (input) => {
            try {
                const volumeResponse = await this.obs.call('GetInputVolume', {
                    inputUuid: input.inputUuid
                });
                return {
                    inputKind: input.inputKind,
                    name: input.inputName,
                    uuid: input.inputUuid,
                    volume: volumeResponse.inputVolumeMul * 100
                } as AudioInput;
            } catch {
                console.warn(`Could not fetch volume for ${input.inputName}`);
                return null;
            }
        });
        const result = await Promise.all(promises);
        return result.filter((input): input is AudioInput => input !== null);
    }

    // Add or remove selected inputs
    addSelectedInput(input: AudioInput): void {
        this.selectedInputs$.next([...this.selectedInputs$.value, input]);
    }

    removeSelectedInput(uuid: string): void {
        this.selectedInputs$.next(
            this.selectedInputs$.value.filter((input) => input.uuid !== uuid)
        );
    }

    // Listen to real-time volume updates and merge with inputs
    private setupConnectionListeners(): void {
        this.obs.on('ConnectionOpened', () => {
            this.connectionStatus$.next(true);
        });

        this.obs.on('ConnectionClosed', () => {
            this.connectionStatus$.next(false);
            if (this.wasConnected) {
                this.openDisconnectDialog();
            }
        });
    }

    private listenForVolume() {
        this.obs.on('InputVolumeMeters', (data: any) => {
            const activeInputs = data.inputs || [];
            const updatedInputs = this.inputs$.value.map((input) => {
                const activeInput = activeInputs.find(
                    (active: any) => active.inputUuid === input.uuid
                );
                if (activeInput) {
                    const averageMeterLevel = this.averageLevel(
                        activeInput.inputLevelsMul
                    );
                    return { ...input, meter: averageMeterLevel * 100 }; // Normalize to 0-100
                }
                return { ...input, meter: 0 }; // Reset meter if not active
            });
            this.inputs$.next(updatedInputs);
        });
    }

    // Open connection dialog
    private openConnectionDialog(): void {
        const dialogRef = this.dialog.open(OBSConnectionDialogComponent, {
            disableClose: true
        });
        dialogRef.afterClosed().subscribe((details) => {
            if (details) {
                const { serverAddress, port, password } = details;
                if (serverAddress && port) {
                    this.serverAddress = `ws://${serverAddress}:${port}`;
                    this.connect(this.serverAddress, password);
                }
            }
        });
    }

    // Open disconnect dialog
    private openDisconnectDialog(): void {
        const dialogRef = this.dialog.open(DisconnectDialogComponent, {
            width: '300px',
            data: {
                message:
                    'The connection has been lost. Please try to reconnect.'
            }
        });
        // dialogRef.afterClosed().subscribe(() => this.openConnectionDialog());
    }

    // Helper function to calculate the average volume level from channels
    private averageLevel(levels: number[]): number {
        if (!levels || levels.length === 0) return 0;
        return levels.reduce((sum, level) => sum + level, 0) / levels.length;
    }
}
