import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-obs-connection-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatExpansionModule,
        ReactiveFormsModule
    ],
    templateUrl: './obs-connection-dialog.component.html',
    styleUrl: './obs-connection-dialog.component.scss'
})
export class ObsConnectionDialogComponent {
    obsAddressControl = new FormControl('', [Validators.required]);
    obsPasswordControl = new FormControl('', [Validators.required]);

    constructor (
        private dialogRef: MatDialogRef<ObsConnectionDialogComponent>
    ) {}

    // Method to submit the form
    submit (): void {
        if (this.obsAddressControl.valid && this.obsPasswordControl.valid) {
            this.dialogRef.close({
                address: this.obsAddressControl.value,
                password: this.obsPasswordControl.value
            });
        }
    }
}
