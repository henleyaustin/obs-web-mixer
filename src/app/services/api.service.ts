import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { AudioInput } from '../../_models/AudioInput';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://localhost:3000/obs';

    constructor (private http: HttpClient) {}

    // Method to set the baseUrl and test the connection
    setBaseUrl (newBaseUrl: string): Observable<boolean> {
        this.baseUrl = newBaseUrl;
        return this.http.get<Object>(`${this.baseUrl}/health`).pipe(
            // If the health check API call is successful, return true
            map(() => true),
            // If it fails, return false
            catchError(error => {
                console.error('Connection test failed:', error);
                return of(false);
            })
        );
    }

    // Fetch audio inputs
    getAudioInputs (): Observable<AudioInput[]> {
        return this.http.get<AudioInput[]>(`${this.baseUrl}/obs/allinputs`);
    }

    // Update audio input volume
    updateAudioVolume (
        inputUuid: string,
        inputVolumeMul: number
    ): Observable<any> {
        const body = { inputUuid, inputVolumeMul };
        return this.http.post(`${this.baseUrl}/obs/input`, body);
    }
}
