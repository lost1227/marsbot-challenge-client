import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  private message: string | null

  constructor(router: Router) {
    this.message = router.getCurrentNavigation()?.extras.state?.['message'];
  }

  protected getErrorMessage(): string {
    if(this.message) {
      return this.message;
    } else {
      return ErrorService.unknownErrorMsg;
    }
  }
}
