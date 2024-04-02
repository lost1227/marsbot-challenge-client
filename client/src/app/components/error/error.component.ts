import { Component } from '@angular/core';
import { AppState, AppStateService } from 'src/app/services/app-state.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  private message: string | null

  constructor(
    private errorService: ErrorService,
    private appStateService: AppStateService
  ) {
    this.message = errorService.getLastError()?.message ?? null;
  }

  protected getErrorMessage(): string {
    if(this.message) {
      return this.message;
    } else {
      return ErrorService.unknownErrorMsg;
    }
  }

  protected restart() {
    this.appStateService.nextState(AppState.ASSIGN_ROBOT);
  }
}
