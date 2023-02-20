import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Configuration } from '../models/configuration.model';
import { RobotId } from '../models/remote.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor() { }

  public getConfig(): Configuration|null {
    let storage = environment.configStorage;
    let name = storage.getItem("name");
    let robotId = storage.getItem("robotId") as RobotId | null;

    if(!name || !robotId) {
      return null;
    }

    return {
      name,
      robotId
    };
  }

  public setConfig(config: Configuration) {
    let storage = environment.configStorage;
    storage.setItem("name", config.name);
    storage.setItem("robotId", config.robotId);
  }

  public clearConfig() {
    let storage = environment.configStorage;
    storage.removeItem("name");
    storage.removeItem("robotId");
  }
}
