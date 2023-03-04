import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum AppState {
  NEW_USER,
  WAIT_FOR_GAME,
  PLANNING,
  END_OF_GAME,
  ERROR
};

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  private readonly state = new BehaviorSubject<AppState>(AppState.NEW_USER);

  constructor() {
  }

  public nextState(state: AppState) {
    this.state.next(state);
  }

  public getState(): Observable<AppState> {
    return this.state;
  }
}
