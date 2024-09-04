import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    serverAddressControl = new FormControl('', [Validators.required]);

    constructor (
        private dialogRef: MatDialogRef<ServerConnectionDialogComponent>
    ) {}

    // Method to submit the form
    submit (): void {
        if (this.serverAddressControl.valid) {
            this.dialogRef.close(this.serverAddressControl.value);
        }
    }
}
