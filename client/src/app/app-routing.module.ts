import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { ErrorComponent } from './components/error/error.component';
import { PlannerComponent } from './components/planner/planner.component';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'planner', component: PlannerComponent },
  { path: 'error', component: ErrorComponent },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', redirectTo: '/error' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
