import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private ongoingCalls = new Set<string>();
  constructor() { }

  addCall(guid: string) {
    if (!this.ongoingCalls.has(guid)) {
      this.ongoingCalls.add(guid);
    }
  }

  callFinished(guid: string) {
    if (this.ongoingCalls.has(guid)) {
      this.ongoingCalls.delete(guid);
    }
  }

  get hasOngoingCalls() {
    return this.ongoingCalls.size > 0;
  }
}
