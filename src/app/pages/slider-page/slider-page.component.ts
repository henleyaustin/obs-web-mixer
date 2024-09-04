import {
    CdkDrag,
    CdkDragDrop,
    CdkDragHandle,
    CdkDragMove,
    CdkDragPlaceholder,
    CdkDropList,
    moveItemInArray
} from '@angular/cdk/drag-drop';
import {
    Component,
    ElementRef,
    HostListener,
    inject,
    OnInit
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { AudioInputsService } from '../../services/audio-inputs.service';
import { AudioInput } from '../../../_models/AudioInput';

@Component({
    selector: 'app-slider-page',
    standalone: true,
    imports: [
        MatSliderModule,
        MatButtonModule,
        MatIconModule,
        CdkDropList,
        CdkDrag,
        CdkDragPlaceholder,
        MatCardModule,
        CdkDragHandle
    ],
    templateUrl: './slider-page.component.html',
    styleUrls: ['./slider-page.component.scss']
})
export class SliderPageComponent implements OnInit {
    private el = inject(ElementRef);
    inputService = inject(AudioInputsService);

    itemsPerPage = 12; // Default to 12 items per page
    currentPage = 0;
    totalPages = 0;

    ngOnInit (): void {
        this.inputService.fetchInputs();
        this.updateItemsPerPage();
        this.calculateTotalPages();
    }

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
        this.calculateTotalPages(); // Update total pages based on the new itemsPerPage
    }

    calculateTotalPages (): void {
        this.totalPages = Math.ceil(
            this.inputService.selectedInputs().length / this.itemsPerPage
        );
    }

    getItemsForCurrentPage (): AudioInput[] {
        const startIndex = this.currentPage * this.itemsPerPage;
        return this.inputService
            .selectedInputs()
            .slice(startIndex, startIndex + this.itemsPerPage);
    }

    goToNextPage (): void {
        if (this.currentPage < this.totalPages - 1) this.currentPage++;
    }

    goToPreviousPage (): void {
        if (this.currentPage > 0) this.currentPage--;
    }

    drop (event: CdkDragDrop<AudioInput[]>): void {
        const startIndex = this.currentPage * this.itemsPerPage;
        const tempArray = this.inputService.selectedInputs();
        moveItemInArray(
            tempArray,
            startIndex + event.previousIndex,
            startIndex + event.currentIndex
        );
        this.inputService.selectedInputs.set(tempArray);
    }

    removeOption (uuid: string) {
        this.inputService.removeSelectedInput(uuid);
    }
}
