import {
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDropList
} from '@angular/cdk/drag-drop';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ElementRef,
    Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { sliderInput } from '../slider-page.component';
import { debounceTime, Subject } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'slider-card',
    standalone: true,
    imports: [
        MatSliderModule,
        MatButtonModule,
        MatIconModule,
        CdkDropList,
        CdkDrag,
        CdkDragPlaceholder,
        MatCardModule,
        CdkDragHandle,
        ReactiveFormsModule,
        FormsModule
    ],
    templateUrl: './slider-card.component.html',
    styleUrls: ['./slider-card.component.scss']
})
export class SliderCardComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() slider!: sliderInput;
    @Output() remove = new EventEmitter<string>();
    @Output() newVolume = new EventEmitter<number>();

    @ViewChild('stage', { static: false })
    stage!: ElementRef<HTMLCanvasElement>;

    private volumeChange$ = new Subject<number>();
    private animationFrameId: number = 0;
    volume: number = 0;
    barCount: number = 30;
    currentMeter: number = 0; // Keep track of the current volume animation

    ngOnInit (): void {
        this.volume = this.slider?.volume;

        // Debounced volume change event
        this.volumeChange$.pipe(debounceTime(100)).subscribe(volume => {
            this.newVolume.emit(volume);
        });
    }

    ngAfterViewInit (): void {
        this.drawMeter();
    }

    onRemove (): void {
        this.remove.emit(this.slider.uuid);
    }

    changeVolume (event: any): void {
        this.volumeChange$.next(event);
    }

    drawMeter (): void {
        const ratio = window.devicePixelRatio || 1; // Get the pixel ratio for high-DPI screens
        const canvas = this.stage.nativeElement;
        const parentElement = canvas.parentElement; // Get the parent element of the canvas
        const context = canvas.getContext('2d');

        if (parentElement && context) {
            context.imageSmoothingEnabled = false;

            // Set canvas size based on the parent's size
            const w = parentElement.offsetWidth;
            const h = 15;

            // Adjust canvas size for high-DPI displays
            canvas.width = w * ratio;
            canvas.height = h * ratio;

            // Scale the context to handle high-DPI
            context.scale(ratio, ratio);

            const barGap = 0.01 * w; // Set bar gap based on width

            const draw = () => {
                const meterValue =
                    this.slider.meter > 1 ? this.slider.meter * 7 : 0;

                if (this.currentMeter < meterValue) {
                    this.currentMeter += (meterValue - this.currentMeter) * 0.3;
                } else {
                    this.currentMeter -= (meterValue - this.currentMeter) * 0.3;
                }

                // Clear the canvas
                context.clearRect(0, 0, w, h);

                // Draw the volume bars
                for (let i = 0; i < this.barCount; i++) {
                    context.beginPath();
                    // Get color and lightness for the current bar
                    const { color, lightness } = this.getBoxColor(
                        i,
                        meterValue
                    );
                    context.fillStyle = color;

                    // Conditionally apply shadow only to bright bars
                    if (lightness > 30) {
                        context.shadowColor = color; // Apply shadow color if bar is bright
                        context.shadowBlur = 5;
                    } else {
                        context.shadowColor = 'transparent'; // No shadow for darker bars
                        context.shadowBlur = 0;
                    }

                    const width = w / (this.barCount + 1) - barGap;
                    context.rect(
                        barGap * (i + 1) + i * width,
                        h * 0.1,
                        width,
                        h - 2 * 0.1 * h
                    );

                    context.fill();
                }

                // Recursively call draw using requestAnimationFrame
                this.animationFrameId = requestAnimationFrame(draw);
            };

            draw(); // Start the drawing process
        }
    }

    // Utility function to calculate the color and lightness of each bar
    getBoxColor (
        i: number,
        meter: number
    ): { color: string; lightness: number } {
        let h = 99; // Default hue value
        if (i > this.barCount * 0.65) {
            h = 48; // Yellowish color
        }
        if (i > this.barCount * 0.9) {
            h = 0; // Red color
        }

        let l = 13; // Default lightness
        if ((i / this.barCount) * 100 < meter) {
            l = 50; // Lighten the bars that are below the current meter value
        }

        const color = `hsl(${h}, 80%, ${l}%)`;
        return { color, lightness: l }; // Return both color and lightness
    }

    ngOnDestroy (): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId); // Stop the animation when the component is destroyed
        }
    }
}
