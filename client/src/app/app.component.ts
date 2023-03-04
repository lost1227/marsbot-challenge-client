import { Component } from '@angular/core';
import { BehaviorSubject, map, Observable, ReplaySubject } from 'rxjs';
import { AppState, AppStateService } from './services/app-state.service';
import { GameStateService } from './services/game-state.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected state: Observable<AppState>
  protected stateType = AppState

  protected userName = new ReplaySubject<string>(1);

  constructor(
    private appStateService: AppStateService,
    private gameStateService: GameStateService
  ) {
    this.state = appStateService.getState();

    gameStateService.watchUserRobot().pipe(
      map(it => it?.user.name ?? "")
    ).subscribe(
      this.userName
    );
  }
}
