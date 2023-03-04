import { Injectable } from '@angular/core';

import { v1 as uuidv1 } from 'uuid';

import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';
import { RobotId } from '../models/remote.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private storage = environment.configStorage;
  constructor() { }

  public getClientId(): string {
    let clientId = this.storage.getItem("clientId");
    if(clientId == null) {
      clientId = uuidv1();
      this.storage.setItem("clientId", clientId);
    }
    return clientId;
  }

  public getCurrUser(gameId: string): User|null {
    const clientId = this.getClientId();

    let lastGameId = this.storage.getItem("gameId");
    if(!lastGameId || lastGameId != gameId) {
      this.clearConfig();
      return null;
    }

    let name = this.storage.getItem("name");
    if(name == null) {
      return null;
    }

    return {
      gameId,
      clientId,
      name
    };
  }

  public setUserForGame(gameId: string, name: string): User {
    const clientId = this.getClientId();
    this.storage.setItem("gameId", gameId);
    this.storage.setItem("name", name);

    return {
      gameId,
      clientId,
      name
    };
  }

  public clearConfig() {
    this.storage.removeItem("gameId");
    this.storage.removeItem("name");
  }
}
