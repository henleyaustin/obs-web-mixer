import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface connectionDetails {
    address: string;
    port: string;
    password: string;
}
@Component({
    selector: 'app-server-connection-dialog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatExpansionModule,
        ReactiveFormsModule,
        MatTooltipModule
    ],
    templateUrl: './server-connection-dialog.component.html',
    styleUrl: './server-connection-dialog.component.scss'
})
export class ServerConnectionDialogComponent {
    connectionForm = new FormGroup({
        serverAddress: new FormControl('', [Validators.required]),
        port: new FormControl('', [
            Validators.required,
            Validators.min(1),
            Validators.max(65535)
        ]),
        password: new FormControl('') // Optional password field
    });
    constructor (
        private dialogRef: MatDialogRef<ServerConnectionDialogComponent>
    ) {}

    // Method to submit the form
    // Close the dialog and pass the form values if the form is valid
    submit (): void {
        if (this.connectionForm.valid) {
            this.dialogRef.close(this.connectionForm.value); // Pass form values as an object
        }
    }
}
