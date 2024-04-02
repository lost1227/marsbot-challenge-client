import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from './http-interceptors';

import { AppComponent } from './app.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { PlannerComponent } from './components/planner/planner.component';
import { PlanStepComponent } from './components/planner/plan-step/plan-step.component';
import { RescueConfirmComponent } from './components/planner/rescue-confirm/rescue-confirm.component';
import { ErrorComponent } from './components/error/error.component';
import { SpinnerComponent } from './components/reuse/spinner/spinner.component';

import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatLuxonDateModule } from '@angular/material-luxon-adapter';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { MatDividerModule } from '@angular/material/divider';
import { GameStartComponent } from './components/game-start/game-start.component';
import { GameEndComponent } from './components/game-end/game-end.component';
import { MarsUploadAnimationComponent } from './components/reuse/mars-upload-animation/mars-upload-animation.component';
import { AssignRobotComponent } from './components/assign-robot/assign-robot.component';

@NgModule({
  declarations: [
    AppComponent,
    AssignRobotComponent,
    WelcomeComponent,
    SpinnerComponent,
    PlannerComponent,
    PlanStepComponent,
    RescueConfirmComponent,
    ErrorComponent,
    GameStartComponent,
    GameEndComponent,
    MarsUploadAnimationComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatLuxonDateModule,
    MatDialogModule,
    MatDividerModule,
    MatChipsModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
