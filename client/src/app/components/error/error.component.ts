import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  private error: Error|null;

  constructor(router: Router) {
    this.error = router.getCurrentNavigation()?.extras.state?.['error'];
  }

  protected getErrorMessage(): string {
    return this.error?.message ?? "An unknown error occurred.";
  }
}
