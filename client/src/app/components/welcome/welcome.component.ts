import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, forkJoin, map, Observable, ReplaySubject, take } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { RobotId } from 'src/app/models/remote.model';
import { AppState, AppStateService } from 'src/app/services/app-state.service';
import { UserService } from 'src/app/services/user.service';
import { GameStateService } from 'src/app/services/game-state.service';
import { RemoteService } from 'src/app/services/remote.service';

enum PageState {
  SET_NAME,
  LOADING
};

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  protected pageState = new BehaviorSubject<PageState>(PageState.LOADING);
  protected stateType = PageState;

  protected nameForm = new FormGroup({
    name: new FormControl("", Validators.required)
  });

  constructor(
    private userService: UserService,
    private remoteService: RemoteService,
    private appStateService: AppStateService,
    private gameStateService: GameStateService
  ) {
    gameStateService.getGameState().pipe(
      take(1),
      map(state => userService.getCurrUser(state.gameId))
    ).subscribe(user => {
      if(user) {
        this.remoteService.getRobotAssignment(user.name, user.clientId).subscribe(
          robotId => this.gameStateService.saveRobotId(user, robotId.robot_number));
        appStateService.nextState(AppState.WAIT_FOR_GAME);
      } else {
        this.pageState.next(PageState.SET_NAME);
      }
    });
  }

  protected updateName() {
    const nameValue = this.nameForm.value.name;
    const clientId = this.userService.getClientId();
    if(!this.nameForm.valid || !nameValue) {
      return;
    }
    this.pageState.next(PageState.LOADING);

    forkJoin({
      gameState: this.gameStateService.getGameState().pipe(take(1)),
      robotId: this.remoteService.getRobotAssignment(nameValue, clientId)
    }).subscribe(({gameState, robotId}) => {
      const user = this.userService.setUserForGame(gameState.gameId, nameValue);
      this.gameStateService.saveRobotId(user, robotId.robot_number);
      this.appStateService.nextState(AppState.WAIT_FOR_GAME);
    })
  }

  protected resetConfig() {
    this.userService.clearConfig();
    this.pageState.next(PageState.SET_NAME);
  }
}
