import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-disconnect-dialog',
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
    templateUrl: './disconnect-dialog.component.html',
    styleUrl: './disconnect-dialog.component.scss'
})
export class DisconnectDialogComponent {
    constructor(private dialogRef: MatDialogRef<DisconnectDialogComponent>) {}
}
