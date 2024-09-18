import {
    AfterViewInit,
    Component,
    inject,
    OnInit,
    ViewChild
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject, takeUntil, take } from 'rxjs';
import { AudioInput } from '../../../_models/AudioInput';
import { AsyncPipe } from '@angular/common';
import { AudioInputsService } from '../../services/audio-inputs.service';
import { StorageService } from '../../services/storage.service';

@Component({
    selector: 'multi-select',
    standalone: true,
    imports: [
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatTooltipModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    templateUrl: './multi-select.component.html',
    styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent implements OnInit, AfterViewInit {
    inputService = inject(AudioInputsService);
    storageService = inject(StorageService);

    selectedKey: string = 'SELECTED_INPUTS';

    /** control for the selected inputs for multi-selection */
    public inputMultiCtrl: FormControl<AudioInput[]> = new FormControl<
        AudioInput[]
    >([], { nonNullable: true });

    /** control for the MatSelect filter keyword multi-selection */
    public inputMultiFilterCtrl: FormControl<string> = new FormControl<string>(
        '',
        { nonNullable: true }
    );

    /** list of inputs filtered by search keyword */
    public filteredInputsMulti: ReplaySubject<AudioInput[]> = new ReplaySubject<
        AudioInput[]
    >(1);

    public tooltipMessage = 'Select All / Unselect All';

    @ViewChild('multiSelect', { static: true }) multiSelect!: MatSelect;

    protected _onDestroy = new Subject<void>();

    checkBoxChecked = false;

    ngOnInit (): void {
        this.inputService.inputs.subscribe(inputs => {
            this.filteredInputsMulti.next(inputs);
        });

        this.inputService.selectedInputs.subscribe(currentState => {
            if (currentState !== this.inputMultiCtrl.value) {
                this.inputMultiCtrl.patchValue(currentState);
                if (currentState.length === 0) {
                    this.checkBoxChecked = false;
                }
            }
        });

        // Listen for changes in the search field and filter the inputs
        this.inputMultiFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterInputsMulti();
            });

        // Update the selected inputs when the form control value changes
        this.inputMultiCtrl.valueChanges.subscribe(items => {
            this.storageService.setSessionItem(this.selectedKey, items);
            this.inputService.selectedInputs.next(items);
        });

        const cache = this.storageService.getSessionItem(
            this.selectedKey
        ) as AudioInput[];
        if (cache) this.inputMultiCtrl.patchValue(cache);
    }

    ngAfterViewInit (): void {
        this.setInitialValue();
    }

    ngOnDestroy (): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    toggleSelectAll (selectAllValue: boolean): void {
        this.filteredInputsMulti
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                if (selectAllValue) {
                    this.inputMultiCtrl.patchValue([
                        ...this.inputService.inputs.value
                    ]);
                    this.checkBoxChecked = true;
                } else {
                    this.inputMultiCtrl.patchValue([]);
                    this.checkBoxChecked = false;
                }
            });
    }

    /**
     * Sets the initial value after the filtered inputs are loaded initially
     */
    protected setInitialValue (): void {
        this.filteredInputsMulti
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                this.multiSelect.compareWith = (a: AudioInput, b: AudioInput) =>
                    a && b && a.uuid === b.uuid;
            });
    }

    protected filterInputsMulti (): void {
        const inputs = this.inputService.inputs.value;
        if (!inputs.length) {
            return;
        }

        let search = this.inputMultiFilterCtrl.value;
        if (!search) {
            this.filteredInputsMulti.next(inputs.slice());
            return;
        } else {
            search = search.toLowerCase();
        }

        const filteredInputs = inputs.filter(input =>
            input.name.toLowerCase().includes(search)
        );

        this.filteredInputsMulti.next(filteredInputs);
    }
}
