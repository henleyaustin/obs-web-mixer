import { Component, effect, inject, OnInit, Renderer2 } from '@angular/core';
import {
    NavigationEnd,
    Router,
    RouterModule,
    RouterOutlet
} from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MultiSelectComponent } from './shared/multi-select/multi-select.component';
import { AsyncPipe } from '@angular/common';
import { AudioInputsService } from './services/audio-inputs.service';
import { ServerConnectionDialogComponent } from './dialogs/server-connection-dialog/server-connection-dialog.component';
import { ObsConnectionDialogComponent } from './dialogs/obs-connection-dialog/obs-connection-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
        ObsConnectionDialogComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    private renderer = inject(Renderer2);
    private dialog = inject(MatDialog);
    private inputService = inject(AudioInputsService);

    title = 'OBS Web Mixer';

    themes = {
        dark: 'dark-theme',
        light: 'light-theme'
    };

    currentTheme = this.themes.dark;
    loaded = false;

    constructor () {
        effect(() => {
            this.loaded = this.inputService.inputs().length > 0;
        });
        this.openServerConnectionDialog(); // Start with the server connection dialog
    }

    openServerConnectionDialog (): void {
        const dialogRef = this.dialog.open(ServerConnectionDialogComponent, {
            disableClose: true // Prevents closing the dialog without input
        });

        dialogRef.afterClosed().subscribe(serverAddress => {
            if (serverAddress) {
                this.openObsConnectionDialog(); // Open the OBS dialog after getting a valid server address
            }
        });
    }

    openObsConnectionDialog (): void {
        const dialogRef = this.dialog.open(ObsConnectionDialogComponent, {
            disableClose: true // Prevents closing the dialog without input
        });

        dialogRef.afterClosed().subscribe(obsConnection => {
            if (obsConnection) {
                // Handle OBS connection details here (e.g., connect to OBS)
                console.log('OBS Connection:', obsConnection);
            }
        });
    }

    ngOnInit (): void {
        this.setTheme(this.currentTheme);
    }

    toggleTheme () {
        this.currentTheme = document.body.classList.contains('dark-theme')
            ? 'light-theme'
            : 'dark-theme';

        this.setTheme(this.currentTheme);
    }

    setTheme (theme: string) {
        this.renderer.removeClass(document.body, 'dark-theme');
        this.renderer.removeClass(document.body, 'light-theme');
        this.renderer.addClass(document.body, theme);
    }
}
