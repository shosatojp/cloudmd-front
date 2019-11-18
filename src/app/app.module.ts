import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SingleFile } from './single-file/single-file.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HelpComponent } from './help/help.component';
import { TopComponent } from './top/top.component';
import { DialogComponent } from './dialog/dialog.component';
import { MatDialogModule, MatSnackBarModule } from '@angular/material';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
    declarations: [
        AppComponent,
        SingleFile,
        HelpComponent,
        TopComponent,
        DialogComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatProgressBarModule,
        MatButtonModule,
        MatStepperModule,
        MatCardModule,
        MatRadioModule,
        MatTooltipModule,
        MatBadgeModule,
        FormsModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatExpansionModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [DialogComponent]
})
export class AppModule { }
