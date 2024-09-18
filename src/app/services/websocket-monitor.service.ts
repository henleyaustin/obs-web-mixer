import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ServerConnectionDialogComponent } from '../dialogs/server-connection-dialog/server-connection-dialog.component';
import { StorageService } from './storage.service';
import { SocketConnectionService } from './socket-connection.service';
import { AudioInputsService } from './audio-inputs.service';

@Injectable({
    providedIn: 'root'
})
export class WebSocketMonitorService {
    private serverKey = 'SERVER_IP';
    private serverAddress = '';

    constructor (
        private socketService: SocketConnectionService,
        private inputService: AudioInputsService,
        private dialog: MatDialog,
        private storageService: StorageService
    ) {}

    initialize (): void {
        const address = this.storageService.getSessionItem(this.serverKey);

        if (typeof address === 'string' && address) {
            this.serverAddress = address;
            this.inputService.connectToOBS(address);
        } else {
            this.openServerConnectionDialog();
        }

        // Listen for connection and disconnection events
        this.socketService.connectionStatus$.subscribe(connected => {
            if (connected) {
                console.log('WebSocket connected');
                this.storageService.setSessionItem(
                    this.serverKey,
                    this.serverAddress
                );
            } else {
                console.log('WebSocket disconnected');
                // this.openDisconnectDialog();
            }
        });
    }

    openServerConnectionDialog (): void {
        const dialogRef = this.dialog.open(ServerConnectionDialogComponent, {
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(details => {
            if (details) {
                const { serverAddress, port, password } = details;
                if (serverAddress && port) {
                    this.serverAddress = `ws://${serverAddress}:${port}`;
                    this.inputService.connectToOBS(
                        this.serverAddress,
                        password
                    );
                }
            }
        });
    }

    openDisconnectDialog (): void {
        this.dialog.open(ServerConnectionDialogComponent, {
            width: '300px',
            data: {
                message:
                    'The connection has been lost. Please try to reconnect.'
            }
        });
    }
}
