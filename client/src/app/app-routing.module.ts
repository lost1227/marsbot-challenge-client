import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigComponent } from './components/config/config.component';
import { PlannerComponent } from './components/planner/planner.component';

const routes: Routes = [
  { path: 'config', component: ConfigComponent },
  { path: 'planner', component: PlannerComponent },
  { path: '', redirectTo: '/config', pathMatch: 'full' }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
