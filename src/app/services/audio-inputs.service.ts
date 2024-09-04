import { Injectable, signal } from '@angular/core';
import { AudioInput } from '../../_models/AudioInput';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class AudioInputsService {
    inputs = signal<AudioInput[]>([]);
    selectedInputs = signal<AudioInput[]>([]);

    constructor (private apiService: ApiService) {}

    fetchInputs (): void {
        this.apiService.getAudioInputs().subscribe(inputs => {
            this.inputs.set(inputs);
        });
    }

    updateVolume (inputUuid: string, inputVolumeMul: number): void {
        this.apiService
            .updateAudioVolume(inputUuid, inputVolumeMul)
            .subscribe(() => {
                const updatedInputs = this.inputs().map(input =>
                    input.inputUuid === inputUuid
                        ? { ...input, inputVolumeMul }
                        : input
                );
                this.inputs.set(updatedInputs);
            });
    }

    removeSelectedInput (uuid: string) {
        this.selectedInputs.set(
            this.selectedInputs().filter(input => input.inputUuid !== uuid)
        );
    }
}
