import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AudioInput } from '../../_models/AudioInput';
import { SocketConnectionService } from './socket-connection.service';

/**
 * Service for handling audio input operations (handles subscriptions)
 */
@Injectable({
    providedIn: 'root'
})
export class AudioInputsService {
    private obsService = inject(SocketConnectionService);

    inputs = new BehaviorSubject<AudioInput[]>([]);
    selectedInputs = new BehaviorSubject<AudioInput[]>([]);

    // Connect to OBS WebSocket and fetch inputs
    connectToOBS (url: string, password?: string): void {
        this.obsService
            .connect(url, password)
            .then(() => this.fetchInputs()) // After connection, fetch inputs
            .catch(error => console.error('Error connecting to OBS:', error));
    }

    // Fetch inputs and map them to AudioInput[]
    async fetchInputs (): Promise<void> {
        try {
            const inputsResponse = await this.obsService.fetchInputs();
            const inputsWithVolumes = await this.addVolumeToInputs(
                inputsResponse
            );
            this.inputs.next(inputsWithVolumes);
        } catch (error) {
            console.error('Error fetching inputs:', error);
        }
    }

    // Map each input to AudioInput and fetch their volumes
    private async addVolumeToInputs (inputs: any[]): Promise<AudioInput[]> {
        const inputsWithVolumePromises = inputs.map(async input => {
            try {
                const volumeResponse = await this.obsService.getVolume(
                    input.inputUuid
                );
                return {
                    inputKind: input.inputKind,
                    name: input.inputName,
                    uuid: input.inputUuid,
                    volume: volumeResponse.inputVolumeMul * 100 // Normalize volume to 0-100
                } as AudioInput;
            } catch (error) {
                console.warn(`Could not fetch volume for ${input.inputName}`);
                return null;
            }
        });

        // Await all volume fetches and filter out null values
        const inputsWithVolume = (
            await Promise.all(inputsWithVolumePromises)
        ).filter((input): input is AudioInput => input !== null);

        return inputsWithVolume;
    }

    // Update the volume of an input and propagate the changes to the inputs BehaviorSubject
    updateVolume (uuid: string, volume: number): void {
        this.obsService.updateVolume(uuid, volume).then(() => {
            const updatedInputs = this.inputs.value.map(input =>
                input.uuid === uuid ? { ...input, volume } : input
            );
            this.inputs.next(updatedInputs);
        });
    }

    // Disconnect from OBS
    disconnectFromOBS (): void {
        this.obsService.disconnect();
    }

    // Add or remove selected inputs
    addSelectedInput (input: AudioInput): void {
        this.selectedInputs.next([...this.selectedInputs.value, input]);
    }

    removeSelectedInput (uuid: string): void {
        const filteredInputs = this.selectedInputs.value.filter(
            input => input.uuid !== uuid
        );
        this.selectedInputs.next(filteredInputs);
    }
}
