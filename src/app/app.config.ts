import {
    ApplicationConfig,
    importProvidersFrom,
    provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

const config: SocketIoConfig = {
    url: '',
    options: { autoConnect: false }
};

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideAnimationsAsync(),
        provideHttpClient(),
        importProvidersFrom(SocketIoModule.forRoot(config))
    ]
};
