import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
    getAnalytics,
    provideAnalytics,
    ScreenTrackingService
} from '@angular/fire/analytics';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideAnimationsAsync(),
        provideHttpClient(),
        provideFirebaseApp(() =>
            initializeApp({
                projectId: 'obs-web-mixer',
                appId: '1:373529659088:web:055fa3becfc1e18e5a80d5',
                storageBucket: 'obs-web-mixer.firebasestorage.app',
                apiKey: 'AIzaSyD-blBoDUDn5ekBo4k9ae4Me7ejvjyih0w',
                authDomain: 'obs-web-mixer.firebaseapp.com',
                messagingSenderId: '373529659088',
                measurementId: 'G-K6ZENGCBFB'
            })
        ),
        provideAnalytics(() => getAnalytics()),
        ScreenTrackingService
    ]
};
