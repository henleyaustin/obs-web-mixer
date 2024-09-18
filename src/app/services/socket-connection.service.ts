import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import OBSWebSocket, { EventSubscription } from 'obs-websocket-js';

@Injectable({
    providedIn: 'root'
})
export class SocketConnectionService {
    private obs: OBSWebSocket;

    private connectionStatus = new BehaviorSubject<boolean>(false); // Connection status
    public connectionStatus$ = this.connectionStatus.asObservable(); // Observable for connection status

    private activeInputs = new BehaviorSubject<any>(null); // Connection status
    public activeInputs$ = this.activeInputs.asObservable(); // Observable for connection status

    constructor () {
        this.obs = new OBSWebSocket();
        this.checkConnection();
        this.listenToInputVolumeMeters();
    }

    // Connect to OBS WebSocket
    async connect (
        url: string,
        password: string = 'Rwqwb1AgBpao7ZjC'
    ): Promise<void> {
        try {
            await this.obs.connect(url, password, {
                eventSubscriptions: EventSubscription.InputVolumeMeters
            });
            this.connectionStatus.next(true);
        } catch (error) {
            this.connectionStatus.next(false);
            throw error;
        }
    }

    // Disconnect from OBS WebSocket
    disconnect (): void {
        if (this.obs) {
            this.obs.disconnect();
            this.connectionStatus.next(false);
        }
    }

    // Fetch inputs from OBS WebSocket
    async fetchInputs (): Promise<any[]> {
        try {
            const response = await this.obs.call('GetInputList');
            return response.inputs;
        } catch (error) {
            throw error;
        }
    }

    // Fetch input volume
    async getVolume (uuid: string): Promise<any> {
        try {
            const volumeResponse = await this.obs.call('GetInputVolume', {
                inputUuid: uuid
            });
            return volumeResponse;
        } catch (error) {
            throw error;
        }
    }

    private listenToInputVolumeMeters (): void {
        this.obs.on('InputVolumeMeters', (data: any) => {
            const activeInputs = data.inputs;
            this.activeInputs.next(activeInputs);
        });
    }

    // Update input volume
    async updateVolume (uuid: string, volume: number): Promise<void> {
        try {
            await this.obs.call('SetInputVolume', {
                inputUuid: uuid,
                inputVolumeMul: volume / 100 // Normalize to 0-1 for OBS WebSocket
            });
        } catch (error) {
            throw error;
        }
    }

    // Listen for connection events
    private checkConnection (): void {
        this.obs.on('ConnectionOpened', () => {
            this.connectionStatus.next(true);
        });

        this.obs.on('ConnectionClosed', () => {
            this.connectionStatus.next(false);
        });
    }
}
