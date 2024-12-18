import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MultiSelectComponent } from './shared/multi-select/multi-select.component';
import { Subscription } from 'rxjs';
import { SliderPageComponent } from './pages/slider-page/slider-page.component';
import { ThemeService } from './services/theme.service';
import { OBSService } from './services/obs.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MultiSelectComponent,
        SliderPageComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    private obsService = inject(OBSService);

    title = 'OBS Web Mixer';

    loaded = false;
    inputsSub!: Subscription;

    constructor(public themeService: ThemeService) {}

    ngOnInit(): void {
        // Subscribe to the inputs BehaviorSubject to monitor when inputs are loaded
        this.inputsSub = this.obsService.inputs$.subscribe((inputs) => {
            this.loaded = inputs.length > 0;
        });

        this.obsService.initialize();
        this.themeService.Initialize();
    }

    ngOnDestroy(): void {
        if (this.inputsSub) {
            this.inputsSub.unsubscribe();
        }
    }
}
