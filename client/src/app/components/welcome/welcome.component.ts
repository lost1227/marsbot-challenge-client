import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, forkJoin, map, take } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AppState, AppStateService } from 'src/app/services/app-state.service';
import { ClientService } from 'src/app/services/client.service';
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
    private clientService: ClientService,
    private remoteService: RemoteService,
    private appStateService: AppStateService,
    private gameStateService: GameStateService
  ) {
    gameStateService.getRobotId().pipe(take(1)).subscribe(robotId => {
      if(!robotId) {
        appStateService.nextState(AppState.ASSIGN_ROBOT);
      }
    });

    // If we already have a user cached (page was refreshed), use the cached user and go to next
    // state (WAIT_FOR_GAME)
    combineLatest({
      gameState: gameStateService.getGameState(),
      user: gameStateService.getUser()
    }).pipe(take(1)).subscribe(({gameState, user}) => {
      if(gameState.gameId == user?.gameId) {
        appStateService.nextState(AppState.WAIT_FOR_GAME);
      } else {
        // We show a spinner while we check if we have a user cached. Now that we've determined that
        // no user is cached, hide the spinner and show the user registration form
        this.pageState.next(PageState.SET_NAME);
      }
    });
  }

  protected updateName() {
    const nameValue = this.nameForm.value.name;
    if(!this.nameForm.valid || !nameValue) {
      return;
    }
    this.pageState.next(PageState.LOADING);

    this.gameStateService.getGameState().pipe(take(1)).subscribe((gameState) => {
      const user = {
        clientId: this.clientService.getClientId(),
        gameId: gameState.gameId,
        name: nameValue
      } as User;
      this.gameStateService.saveUser(user);
      this.appStateService.nextState(AppState.WAIT_FOR_GAME);
    })
  }

  protected resetConfig() {
    this.gameStateService.clearUser();
    this.pageState.next(PageState.SET_NAME);
  }
}
