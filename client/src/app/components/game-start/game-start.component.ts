import { Component } from '@angular/core';
import { UserWithRobot } from 'src/app/models/user.model';
import { AppState, AppStateService } from 'src/app/services/app-state.service';
import { GameStateService } from 'src/app/services/game-state.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-game-start',
  templateUrl: './game-start.component.html',
  styleUrls: ['./game-start.component.scss']
})
export class GameStartComponent {
  protected readonly user: UserWithRobot | null

  constructor(
    private userService: UserService,
    private appStateService: AppStateService,
    private gameStateService: GameStateService
  ) {
    this.user = gameStateService.getUserRobot();
    if(this.user == null) {
      appStateService.nextState(AppState.NEW_USER);
    }

    gameStateService.waitForGameStart().subscribe(_start => appStateService.nextState(AppState.PLANNING));
  }

  protected clearName() {
    this.userService.clearConfig();
    this.gameStateService.clearUserRobot();
    this.appStateService.nextState(AppState.NEW_USER)
  }
}
