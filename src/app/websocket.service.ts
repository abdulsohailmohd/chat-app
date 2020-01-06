import { Injectable } from '@angular/core';
import * as Rx from 'rxjs/Rx';
// import { Observable } from 'rxjs/Rx';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  private subject: Rx.Subject<MessageEvent>;
  userData = JSON.parse(localStorage.getItem('userData'));

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: ", url);
    }
    return this.subject;
  }

  private create(url): Rx.Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = Rx.Observable.create(
      (obs: Rx.Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);

        return ws.close.bind(ws)
      }
    )

    let observer = {
      next: (data:Object) => {
        if(ws.readyState == WebSocket.OPEN){
          ws.send(JSON.stringify(data))
        }
      }
    }

    ws.onopen = () => {
      ws.send(JSON.stringify({
        user_id: this.userData.userId,
        recipient_id: null,
        type: 'socket',
        token: null,
        message: null
      }));
    }

    return Rx.Subject.create(observer, observable);
  }
}