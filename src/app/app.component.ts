import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MultiSelectComponent } from './shared/multi-select/multi-select.component';
import { AsyncPipe } from '@angular/common';
import { AudioInputsService } from './services/audio-inputs.service';
import { ServerConnectionDialogComponent } from './dialogs/server-connection-dialog/server-connection-dialog.component';
import { Subscription } from 'rxjs';
import { SliderPageComponent } from './pages/slider-page/slider-page.component';
import { WebSocketMonitorService } from './services/websocket-monitor.service';
import { SocketConnectionService } from './services/socket-connection.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterModule,
        RouterOutlet,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MultiSelectComponent,
        AsyncPipe,
        ServerConnectionDialogComponent,
        SliderPageComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    private renderer = inject(Renderer2);
    private inputService = inject(AudioInputsService);
    private webSocketMonitor = inject(WebSocketMonitorService);
    private socketService = inject(SocketConnectionService);

    title = 'OBS Web Mixer';

    themes = {
        dark: 'dark-theme',
        light: 'light-theme'
    };

    currentTheme = this.themes.dark;
    loaded = false;
    inputsSub!: Subscription;

    ngOnInit (): void {
        // Subscribe to the inputs BehaviorSubject to monitor when inputs are loaded
        this.inputsSub = this.inputService.inputs.subscribe(inputs => {
            this.loaded = inputs.length > 0;
        });

        this.webSocketMonitor.initialize();

        this.socketService.connectionStatus$.subscribe(connected => {
            this.loaded = connected;
        });

        this.setTheme(this.currentTheme);
    }

    ngOnDestroy (): void {
        if (this.inputsSub) {
            this.inputsSub.unsubscribe();
        }
    }

    toggleTheme (): void {
        this.currentTheme = document.body.classList.contains('dark-theme')
            ? 'light-theme'
            : 'dark-theme';

        this.setTheme(this.currentTheme);
    }

    setTheme (theme: string): void {
        this.renderer.removeClass(document.body, 'dark-theme');
        this.renderer.removeClass(document.body, 'light-theme');
        this.renderer.addClass(document.body, theme);
    }
}
