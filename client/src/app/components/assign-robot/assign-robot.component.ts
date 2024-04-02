import { Component } from '@angular/core';
import { Subscription, catchError, interval, map, of, switchMap, timer } from 'rxjs';
import { AppState, AppStateService } from 'src/app/services/app-state.service';
import { GameStateService } from 'src/app/services/game-state.service';
import { RemoteService } from 'src/app/services/remote.service';
import { ClientService } from 'src/app/services/client.service';

@Component({
  selector: 'app-assign-robot',
  templateUrl: './assign-robot.component.html',
  styleUrl: './assign-robot.component.scss'
})
export class AssignRobotComponent {
  constructor(
    protected userService: ClientService,
    gameStateService: GameStateService,
    appStateService: AppStateService,
    remoteService: RemoteService
  ){
    this.robotIdPolling = timer(0, 1000)
      .pipe(
        switchMap(() => remoteService.getRobotAssignment(userService.getClientId(), false).pipe(
          catchError((error) => {
            if(error instanceof Error && error.message == "No robot assigned") {
              return of(null);
            }
            throw error;
          }))
        ),
        map(response => response?.robot_number)
      ).subscribe((robot) => {
        if(robot) {
          gameStateService.saveRobotId(robot);
          appStateService.nextState(AppState.NEW_USER);
        } else {
          gameStateService.clearRobotId();
        }
      })
  }

  robotIdPolling!: Subscription;

  ngOnDestroy(): void {
    this.robotIdPolling.unsubscribe();
  }
}
