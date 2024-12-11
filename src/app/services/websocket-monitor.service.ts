import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OBSConnectionDialogComponent } from '../dialogs/obs-connection-dialog/obs-connection-dialog.component';
import { StorageService } from './storage.service';
import { OBSConnectionService } from './socket-connection.service';
import { AudioInputsService } from './audio-inputs.service';
import { DisconnectDialogComponent } from '../dialogs/reconnect-dialog/disconnect-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class WebSocketMonitorService {
    // private serverKey = 'SERVER_IP';
    // private serverAddress = '';
    // private wasConnected = false; // Tracks previous connection state
    // constructor(
    //     private socketService: OBSConnectionService,
    //     private inputService: AudioInputsService,
    //     private dialog: MatDialog,
    //     private storageService: StorageService
    // ) {}
    // initialize(): void {
    //     const address = this.storageService.getSessionItem(this.serverKey);
    //     if (typeof address === 'string' && address) {
    //         this.serverAddress = address;
    //         this.connectToOBS(address);
    //     } else {
    //         this.openServerConnectionDialog();
    //     }
    // }
    // private connectToOBS(address: string, password?: string): void {
    //     // Trigger connection
    //     this.inputService.connectToOBS(address, password);
    //     // Subscribe to connection status updates
    //     this.socketService.connectionStatus$.subscribe((connected) => {
    //         if (connected) {
    //             console.log('WebSocket connected');
    //             this.wasConnected = true; // Mark as connected
    //             this.storageService.setSessionItem(this.serverKey, address);
    //         } else {
    //             console.log('WebSocket disconnected');
    //             if (this.wasConnected) {
    //                 // Show disconnect dialog only if previously connected
    //                 this.openDisconnectDialog();
    //             } else {
    //                 // Show connection dialog if not connected at all
    //                 this.openServerConnectionDialog();
    //             }
    //         }
    //     });
    // }
    // openServerConnectionDialog(): void {
    //     const dialogRef = this.dialog.open(OBSConnectionDialogComponent, {
    //         disableClose: true
    //     });
    //     dialogRef.afterClosed().subscribe((details) => {
    //         if (details) {
    //             const { serverAddress, port, password } = details;
    //             if (serverAddress && port) {
    //                 this.serverAddress = `ws://${serverAddress}:${port}`;
    //                 this.connectToOBS(this.serverAddress, password);
    //             }
    //         }
    //     });
    // }
    // openDisconnectDialog(): void {
    //     const dialogRef = this.dialog.open(DisconnectDialogComponent, {
    //         width: '300px',
    //         data: {
    //             message:
    //                 'The connection has been lost. Please try to reconnect.'
    //         }
    //     });
    //     dialogRef
    //         .afterClosed()
    //         .subscribe(() => this.openServerConnectionDialog());
    // }
}
