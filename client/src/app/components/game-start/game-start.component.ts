import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { UserWithRobot } from 'src/app/models/user.model';
import { AppState, AppStateService } from 'src/app/services/app-state.service';
import { GameStateService } from 'src/app/services/game-state.service';
import { ClientService } from 'src/app/services/client.service';

@Component({
  selector: 'app-game-start',
  templateUrl: './game-start.component.html',
  styleUrls: ['./game-start.component.scss']
})
export class GameStartComponent {
  protected user: UserWithRobot | null = null;

  constructor(
    private userService: ClientService,
    private appStateService: AppStateService,
    private gameStateService: GameStateService
  ) {
    gameStateService.getUserRobot().pipe(take(1)).subscribe(userRobot => {
      if(userRobot == null) {
        appStateService.nextState(AppState.NEW_USER);
      }
      this.user = userRobot;
    });


    gameStateService.waitForGameStart().subscribe(_start => this.appStateService.nextState(AppState.PLANNING));
  }

  protected clearName() {
    this.gameStateService.clearUser();
    this.appStateService.nextState(AppState.NEW_USER)
  }
}
