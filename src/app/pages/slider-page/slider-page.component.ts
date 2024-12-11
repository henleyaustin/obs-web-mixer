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
import { AudioInput } from '../../../_models/AudioInput';
import { Subscription } from 'rxjs';
import { SliderCardComponent } from './slider-card/slider-card.component';
import { OBSService } from '../../services/obs.service';

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
    private obsService = inject(OBSService);

    itemsPerPage = 10;
    currentPage = 0;
    totalPages = 0;
    currentSliders: sliderInput[] = [];
    selectedInputsSub!: Subscription;
    activeInputsSub!: Subscription;

    ngOnInit(): void {
        // Subscribe to selected inputs and map them to sliders
        this.selectedInputsSub = this.obsService.selectedInputs$.subscribe(
            (inputs) => {
                this.currentSliders = this.mapToSliders(inputs);
                this.updateItemsPerPage();
                this.calculateTotalPages();
            }
        );
    }

    // Map selected inputs to the sliderInput interface
    private mapToSliders(inputs: AudioInput[]): sliderInput[] {
        return inputs.map((input) => ({
            name: input.name,
            uuid: input.uuid,
            volume: input.volume,
            meter: input.meter // Initialize meter as 0, will be updated by real-time data
        }));
    }

    ngOnDestroy(): void {
        if (this.selectedInputsSub) this.selectedInputsSub.unsubscribe();
        if (this.activeInputsSub) this.activeInputsSub.unsubscribe();
    }

    // Update the number of items per page based on the screen size
    @HostListener('window:resize', ['$event'])
    onResize(): void {
        this.updateItemsPerPage();
        this.calculateTotalPages();
    }

    updateItemsPerPage(): void {
        const screenHeight = this.el.nativeElement.offsetHeight;
        const screenWidth = this.el.nativeElement.offsetWidth;

        const rows = Math.floor((screenHeight - 200) / 140);
        this.itemsPerPage = screenWidth < 768 ? rows : rows * 2;
        this.calculateTotalPages();
    }

    calculateTotalPages(): void {
        this.totalPages = Math.ceil(
            this.currentSliders.length / this.itemsPerPage
        );
    }

    getItemsForCurrentPage(): sliderInput[] {
        const startIndex = this.currentPage * this.itemsPerPage;
        return this.currentSliders.slice(
            startIndex,
            startIndex + this.itemsPerPage
        );
    }

    goToNextPage(): void {
        if (this.currentPage < this.totalPages - 1) this.currentPage++;
    }

    goToPreviousPage(): void {
        if (this.currentPage > 0) this.currentPage--;
    }

    drop(event: CdkDragDrop<sliderInput[]>): void {
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
        const updatedSelectedInputs = reorderedSliders.map((slider) => {
            // Find the corresponding AudioInput object from selectedInputs
            const input = this.obsService.selectedInputs$.value.find(
                (selected) => selected.uuid === slider.uuid
            );
            return input!;
        });

        // Update the selectedInputs BehaviorSubject with the new order
        this.obsService.selectedInputs$.next(updatedSelectedInputs);
    }

    removeOption(uuid: string): void {
        this.obsService.removeSelectedInput(uuid);
    }

    changeVolume(uuid: string, newVol: number) {
        this.obsService.updateVolume(uuid, newVol);
    }
}
