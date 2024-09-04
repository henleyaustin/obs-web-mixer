import {
    AfterViewInit,
    Component,
    effect,
    inject,
    OnInit,
    ViewChild
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
    Observable,
    startWith,
    map,
    ReplaySubject,
    Subject,
    takeUntil,
    take
} from 'rxjs';
import { AudioInput, AUDIOINPUTS } from '../../../_models/AudioInput';
import { AsyncPipe } from '@angular/common';
import { AudioInputsService } from '../../services/audio-inputs.service';

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
    styleUrl: './multi-select.component.scss'
})
export class MultiSelectComponent implements OnInit, AfterViewInit {
    inputService = inject(AudioInputsService);

    /** control for the selected bank for multi-selection */
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

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    checkBoxChecked = false;

    constructor () {
        effect(() => {
            var currentState = this.inputService.selectedInputs();
            if (currentState !== this.inputMultiCtrl.value) {
                this.inputMultiCtrl.patchValue(currentState);
                if (currentState.length == 0) this.checkBoxChecked = false;
            }
        });
    }

    ngOnInit () {
        // set initial selection
        this.inputMultiCtrl.setValue([]);

        // load the initial input list
        this.filteredInputsMulti.next(this.inputService.inputs());

        // listen for search field value changes
        this.inputMultiFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterInputsMulti();
            });

        this.inputMultiCtrl.valueChanges.subscribe(value => {
            this.inputService.selectedInputs.set(value);
        });
    }

    ngAfterViewInit () {
        this.setInitialValue();
    }

    ngOnDestroy () {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    toggleSelectAll (selectAllValue: boolean) {
        this.filteredInputsMulti
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                if (selectAllValue) {
                    this.inputMultiCtrl.patchValue([
                        ...this.inputService.inputs()
                    ]);
                    this.checkBoxChecked = true;
                } else {
                    this.inputMultiCtrl.patchValue([]);
                    this.checkBoxChecked = false;
                }
            });
    }

    /**
     * Sets the initial value after the filteredBanks are loaded initially
     */
    protected setInitialValue () {
        this.filteredInputsMulti
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                this.multiSelect.compareWith = (a: AudioInput, b: AudioInput) =>
                    a && b && a.inputUuid === b.inputUuid;
            });
    }

    protected filterInputsMulti () {
        if (!!!this.inputService.inputs().length) {
            return;
        }
        // get the search keyword
        let search = this.inputMultiFilterCtrl.value;
        if (!search) {
            this.filteredInputsMulti.next(this.inputService.inputs().slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredInputsMulti.next(
            this.inputService
                .inputs()
                .filter(
                    inputs =>
                        inputs.inputName.toLowerCase().indexOf(search) > -1
                )
        );
    }
}
