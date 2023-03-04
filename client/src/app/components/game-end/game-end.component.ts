import { Component } from '@angular/core';
import { AppState, AppStateService } from 'src/app/services/app-state.service';

@Component({
  selector: 'app-game-end',
  templateUrl: './game-end.component.html',
  styleUrls: ['./game-end.component.scss']
})
export class GameEndComponent {
  constructor(
    private appStateService: AppStateService
  ) {}

  protected restart() {
    this.appStateService.nextState(AppState.NEW_USER);
  }
}
