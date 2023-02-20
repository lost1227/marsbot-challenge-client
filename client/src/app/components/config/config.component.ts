import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, ReplaySubject } from 'rxjs';
import { Configuration } from 'src/app/models/configuration.model';
import { RobotId } from 'src/app/models/remote.model';
import { ConfigService } from 'src/app/services/config.service';
import { RemoteService } from 'src/app/services/remote.service';

enum PageState {
  SET_NAME,
  LOAD_RID,
  SHOW_CONFIG
};

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent {
  protected currConfig = new ReplaySubject<Configuration>(1);
  protected state: BehaviorSubject<PageState>;
  protected stateType = PageState;

  protected nameForm;

  constructor(
    private configService: ConfigService,
    private remoteService: RemoteService
  ) {
    const config = configService.getConfig();

    let state = PageState.SET_NAME;
    let name = '';
    if(config) {
      name = config.name;
      this.currConfig.next(config);
      state = PageState.SHOW_CONFIG;
    }

    this.state = new BehaviorSubject<PageState>(state);

    this.nameForm = new FormGroup({
      name: new FormControl(name, Validators.required)
    });

    this.currConfig.subscribe(configService.setConfig);
  }

  protected updateName() {
    const nameValue = this.nameForm.value.name;
    if(!this.nameForm.valid || !nameValue) {
      return;
    }
    this.state.next(PageState.LOAD_RID);

    this.remoteService.getRobotAssignment(nameValue).subscribe((rid) => {
      this.state.next(PageState.SHOW_CONFIG);
      this.currConfig.next({
        name: nameValue!!,
        robotId: rid.robot_number
      });
    })
  }

  protected resetConfig() {
    this.configService.clearConfig();
    this.state.next(PageState.SET_NAME);
  }
}
