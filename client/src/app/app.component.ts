import { Component } from '@angular/core';
import { BehaviorSubject, map, Observable, ReplaySubject } from 'rxjs';
import { User, UserWithRobot } from './models/user.model';
import { AppState, AppStateService } from './services/app-state.service';
import { GameStateService } from './services/game-state.service';
import { RobotId } from './models/remote.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected state: Observable<AppState>;
  protected stateType = AppState;

  protected user: Observable<User|null>;
  protected robot: Observable<RobotId|null>;

  constructor(
    private appStateService: AppStateService,
    gameStateService: GameStateService
  ) {
    this.state = appStateService.getState();
    this.robot = gameStateService.getRobotId();
    this.user = gameStateService.getUser();
  }

  refreshRobot(): void {
    this.appStateService.nextState(AppState.ASSIGN_ROBOT);
  }
}
