import { Injectable } from '@angular/core';

import { v1 as uuidv1 } from 'uuid';

import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';
import { RobotId } from '../models/remote.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
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

  public getPersistedUser(): User|null {
    const clientId = this.getClientId();

    let gameId = this.storage.getItem("gameId");
    let name = this.storage.getItem("name");

    if(!gameId || !name) {
      this.clearStorage();
      return null;
    }

    return {
      gameId,
      clientId,
      name
    };
  }

  public persistUserForGame(gameId: string, name: string): User {
    const clientId = this.getClientId();
    this.storage.setItem("gameId", gameId);
    this.storage.setItem("name", name);

    return {
      gameId,
      clientId,
      name
    };
  }

  public clearStorage() {
    this.storage.removeItem("gameId");
    this.storage.removeItem("name");
  }
}
