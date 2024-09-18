// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// @Injectable({
//     providedIn: 'root'
// })
// export class SocketConnectionService {
//     private socket: Socket;

//     constructor (private ngxSocketService: NgxSocketService) {
//         this.socket = this.ngxSocketService.getSocket(); // Access the initialized socket
//     }

//     // Set the server URL and reconnect to the new server
//     setServerUrl (url: string): void {
//         this.ngxSocketService.setServerUrl(url); // Reinitialize the socket with the new URL
//         this.socket = this.ngxSocketService.getSocket(); // Update the reference to the new socket
//     }

//     // Request inputs from the server
//     requestInputs (): void {
//         this.socket.emit('requestInputs');
//     }

//     // Listen for updates
//     onInputUpdates (): Observable<any> {
//         return this.socket.fromEvent('currentInputs');
//     }

//     updateVolume (uuid: string, newVol: number): void {
//         this.socket.emit('setVolume', { uuid, newVol });
//     }

//     // Listen for volume updates
//     onVolumeUpdates (): Observable<any> {
//         return this.socket.fromEvent('volumeUpdated');
//     }

//     // Listen for connection events
//     onConnect (): Observable<void> {
//         return this.socket.fromEvent('connect');
//     }

//     // Listen for disconnection events
//     onDisconnect (): Observable<void> {
//         return this.socket.fromEvent('disconnect');
//     }

//     // Listen for error events
//     onError (): Observable<any> {
//         return this.socket.fromEvent('error');
//     }
// }
