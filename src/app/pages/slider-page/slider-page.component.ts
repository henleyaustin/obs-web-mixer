import {
    Component,
    ElementRef,
    HostListener,
    inject,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    CdkDragDrop,
    DragDropModule,
    moveItemInArray
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { AudioInputsService } from '../../services/audio-inputs.service';
import { AudioInput } from '../../../_models/AudioInput';
import { Subscription } from 'rxjs';
import { SliderCardComponent } from './slider-card/slider-card.component';
import { SocketConnectionService } from '../../services/socket-connection.service';

export interface sliderInput {
    name: string;
    uuid: string;
    volume: number;
    meter: number; // Real-time volume meter value
}

@Component({
    selector: 'app-slider-page',
    standalone: true,
    imports: [
        MatSliderModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        SliderCardComponent,
        DragDropModule
    ],
    templateUrl: './slider-page.component.html',
    styleUrls: ['./slider-page.component.scss']
})
export class SliderPageComponent implements OnInit, OnDestroy {
    private el = inject(ElementRef);
    inputService = inject(AudioInputsService);
    private socketService = inject(SocketConnectionService);

    itemsPerPage = 10; // Default to 12 items per page
    currentPage = 0;
    totalPages = 0;
    currentSliders: sliderInput[] = []; // The list of sliders to display on screen
    selectedInputsSub!: Subscription; // Subscription for selected inputs
    activeInputsSub!: Subscription; // Subscription for active input levels

    ngOnInit (): void {
        // Subscribe to selected inputs and map them to sliders
        this.selectedInputsSub = this.inputService.selectedInputs.subscribe(
            inputs => {
                this.currentSliders = this.mapToSliders(inputs);
                this.updateItemsPerPage();
                this.calculateTotalPages();
            }
        );

        // Subscribe to real-time volume levels from OBS
        this.activeInputsSub = this.socketService.activeInputs$.subscribe(
            activeInputs => {
                this.updateSliderMeters(activeInputs); // Map real-time meter data to sliders
            }
        );
    }

    // Map selected inputs to the sliderInput interface
    private mapToSliders (inputs: AudioInput[]): sliderInput[] {
        return inputs.map(input => ({
            name: input.name,
            uuid: input.uuid,
            volume: input.volume,
            meter: 0 // Initialize meter as 0, will be updated by real-time data
        }));
    }

    // Update the meter (volume level) for each slider based on real-time data from OBS
    private updateSliderMeters (activeInputs: any[]): void {
        this.currentSliders = this.currentSliders.map(slider => {
            const activeInput = activeInputs?.find(
                input => input.inputUuid === slider.uuid
            );

            if (activeInput) {
                const averageMeterLevel = this.averageLevel(
                    activeInput.inputLevelsMul[0]
                ); // Calculate the average of the volume levels for each channel
                return { ...slider, meter: averageMeterLevel * 100 }; // Normalize meter level to 0-100
            }
            return slider;
        });
    }

    // Helper function to calculate the average volume level from channels
    averageLevel (levels: number[]): number {
        if (!levels || levels.length === 0) return 0; // Return 0 if levels array is empty or undefined
        return levels.reduce((sum, level) => sum + level, 0) / levels.length;
    }

    ngOnDestroy (): void {
        if (this.selectedInputsSub) this.selectedInputsSub.unsubscribe();
        if (this.activeInputsSub) this.activeInputsSub.unsubscribe();
    }

    // Update the number of items per page based on the screen size
    @HostListener('window:resize', ['$event'])
    onResize (): void {
        this.updateItemsPerPage();
        this.calculateTotalPages();
    }

    updateItemsPerPage (): void {
        const screenHeight = this.el.nativeElement.offsetHeight;
        const screenWidth = this.el.nativeElement.offsetWidth;

        const rows = Math.floor(screenHeight / 150);
        this.itemsPerPage = screenWidth < 768 ? rows : rows * 2;
        this.calculateTotalPages();
    }

    calculateTotalPages (): void {
        this.totalPages = Math.ceil(
            this.currentSliders.length / this.itemsPerPage
        );
    }

    getItemsForCurrentPage (): sliderInput[] {
        const startIndex = this.currentPage * this.itemsPerPage;
        return this.currentSliders.slice(
            startIndex,
            startIndex + this.itemsPerPage
        );
    }

    goToNextPage (): void {
        if (this.currentPage < this.totalPages - 1) this.currentPage++;
    }

    goToPreviousPage (): void {
        if (this.currentPage > 0) this.currentPage--;
    }

    drop (event: CdkDragDrop<sliderInput[]>): void {
        // Calculate the start index for the current page
        const startIndex = this.currentPage * this.itemsPerPage;

        // Create a shallow copy of the current sliders
        const reorderedSliders = [...this.currentSliders];

        // Reorder the sliders based on the drag event
        moveItemInArray(
            reorderedSliders,
            startIndex + event.previousIndex,
            startIndex + event.currentIndex
        );

        // Update current sliders to reflect the new order
        this.currentSliders = reorderedSliders;

        // Now map the reordered sliders back to selectedInputs
        const updatedSelectedInputs = reorderedSliders.map(slider => {
            // Find the corresponding AudioInput object from selectedInputs
            const input = this.inputService.selectedInputs.value.find(
                selected => selected.uuid === slider.uuid
            );
            return input!;
        });

        // Update the selectedInputs BehaviorSubject with the new order
        this.inputService.selectedInputs.next(updatedSelectedInputs);
    }

    removeOption (uuid: string): void {
        this.inputService.removeSelectedInput(uuid);
    }

    changeVolume (uuid: string, newVol: number) {
        this.inputService.updateVolume(uuid, newVol);
    }
}
