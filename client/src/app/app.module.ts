import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ConfigComponent } from './components/config/config.component';
import { PlannerComponent } from './components/planner/planner.component';
import { PlanStepComponent } from './components/planner/plan-step/plan-step.component';
import { RescueConfirmComponent } from './components/planner/rescue-confirm/rescue-confirm.component';
import { SpinnerComponent } from './components/reuse/spinner/spinner.component';

import { AppRoutingModule } from './app-routing.module';
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
import { ErrorComponent } from './components/error/error.component';
import { httpInterceptorProviders } from './http-interceptors';

@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    SpinnerComponent,
    PlannerComponent,
    PlanStepComponent,
    RescueConfirmComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
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
    MatDialogModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
