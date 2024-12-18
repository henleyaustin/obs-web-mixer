import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { AudioInput } from '../../_models/AudioInput';
import { DisconnectDialogComponent } from '../dialogs/reconnect-dialog/disconnect-dialog.component';
import { OBSConnectionDialogComponent } from '../dialogs/obs-connection-dialog/obs-connection-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class OBSService {
    config: SocketIoConfig = {
        url: '',
        options: {
            transports: ['websocket'],
            autoConnect: false
        }
    };

    private serverKey = 'SERVER_IP';
    private serverAddress = '';
    private wasConnected = false;

    public connectionStatus$ = new BehaviorSubject<boolean>(false);
    public inputs$ = new BehaviorSubject<AudioInput[]>([]);
    public selectedInputs$ = new BehaviorSubject<AudioInput[]>([]);

    constructor(private socket: Socket, private dialog: MatDialog) {
        this.setupSocketListeners();
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

    // Connect to the relay server
    connect(url: string): void {
        // Disconnect existing connection
        this.socket.disconnect();

        this.config.url = url;
        this.socket = new Socket(this.config);

        // Reconnect
        this.socket.connect();
        this.setupSocketListeners();

        this.serverAddress = url;
        sessionStorage.setItem(this.serverKey, url);
    }

    // Setup socket event listeners
    private setupSocketListeners(): void {
        // Connection established
        this.socket.fromEvent('connect').subscribe(() => {
            console.log('Connected to relay server');
            this.connectionStatus$.next(true);
            this.wasConnected = true;
            this.listenForVolume();
            this.fetchInputs();
        });

        // Connection error
        this.socket.fromEvent('connect_error').subscribe((error) => {
            console.error('Socket connection error:', error);
            this.connectionStatus$.next(false);
            if (this.wasConnected) this.openDisconnectDialog();
            else this.openConnectionDialog();
        });

        // Disconnection
        this.socket.fromEvent('disconnect').subscribe((reason) => {
            console.log('Disconnected from relay server:', reason);
            this.connectionStatus$.next(false);
            this.removeAddress();
            if (this.wasConnected) this.openDisconnectDialog();
        });

        // OBS responses
        this.socket
            .fromEvent('obs-response')
            .subscribe((data: any) => this.handleMessage(data));

        // OBS errors
        this.socket.fromEvent('obs-error').subscribe((error) => {
            console.error('OBS Error:', error);
        });
    }

    // Send message to relay server
    private sendMessage(message: any): void {
        if (this.socket.ioSocket.connected) {
            this.socket.emit('obs-message', message);
        } else {
            console.error('Socket is not connected.');
        }
    }

    // Handle messages from relay server
    private handleMessage(data: any): void {
        if (data.requestType === 'GetInputList') {
            this.handleFetchInputsResponse(data.response.inputs);
        } else if (data.requestType === 'SetInputVolume') {
            console.log('Volume updated successfully');
        } else if (data.event === 'InputVolumeMeters') {
            this.handleVolumeMeters(data.inputs);
        } else if (data.event === 'error') {
            console.error('Error from relay:', data.message);
        }
    }

    // Fetch inputs
    fetchInputs(): void {
        this.sendMessage({ requestType: 'GetInputList', payload: {} });
    }

    private handleFetchInputsResponse(inputs: any[]): void {
        const enrichedInputs = inputs.map((input) => ({
            inputKind: input.inputKind,
            name: input.inputName,
            uuid: input.inputUuid,
            volume: input.volume || 0,
            meter: 0
        }));
        this.inputs$.next(enrichedInputs);
    }

    // Update input volume
    updateVolume(uuid: string, volume: number): void {
        this.sendMessage({
            requestType: 'SetInputVolume',
            payload: { inputUuid: uuid, inputVolumeMul: volume / 100 }
        });

        const updatedInputs = this.inputs$.value.map((input) =>
            input.uuid === uuid ? { ...input, volume } : input
        );
        this.inputs$.next(updatedInputs);
    }

    // Listen for real-time volume updates
    private listenForVolume(): void {
        console.log('Listening for volume updates...');
    }

    private handleVolumeMeters(activeInputs: any[]): void {
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
            return { ...input, meter: 0 }; // Reset if inactive
        });
        this.inputs$.next(updatedInputs);
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

    // Open connection dialog
    private openConnectionDialog(): void {
        const dialogRef = this.dialog.open(OBSConnectionDialogComponent, {
            disableClose: true
        });
        dialogRef.afterClosed().subscribe((details) => {
            if (details) {
                const { serverAddress } = details;
                if (serverAddress) {
                    this.connect(serverAddress);
                }
            }
        });
    }

    // Open disconnect dialog
    private openDisconnectDialog(): void {
        const dialogRef = this.dialog.open(DisconnectDialogComponent, {
            width: '300px',
            data: { message: 'The connection has been lost. Please reconnect.' }
        });
        dialogRef.afterClosed().subscribe((details) => {
            this.removeAddress();
            this.openConnectionDialog();
        });
    }

    // Average volume helper
    private averageLevel(levels: number[]): number {
        if (!levels || levels.length === 0) return 0;
        return levels.reduce((sum, level) => sum + level, 0) / levels.length;
    }

    // Setup connection listeners for network changes
    private setupConnectionListeners(): void {
        window.addEventListener('offline', () => {
            console.warn('Network connection lost');
            this.connectionStatus$.next(false);
            this.socket.disconnect();
        });

        window.addEventListener('online', () => {
            console.log('Network connection restored');
            if (this.serverAddress) this.connect(this.serverAddress);
        });
    }

    private setAddress(address: string): void {
        this.serverAddress = address;
        sessionStorage.setItem(this.serverKey, address);
    }

    private removeAddress(): void {
        this.serverAddress = '';
        sessionStorage.removeItem(this.serverKey);
    }
}
