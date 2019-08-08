import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Instance } from 'simple-peer';

declare var SimplePeer: any;

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  public peers = new Map<string, Instance>();

  private onSignal = new Subject<PeerData>();
  public onSignal$ = this.onSignal.asObservable();

  private onStream = new Subject<PeerData>();
  public onStream$ = this.onStream.asObservable();

  private onConnect = new Subject<PeerData>();
  public onConnect$ = this.onConnect.asObservable();

  private onData = new Subject<PeerData>();
  public onData$ = this.onData.asObservable();

  constructor() { }

  public createPeer(initiator: boolean, stream, userId: string) {
    const peer = new SimplePeer({ initiator, stream });
    this.peers.set(userId, peer);

    peer.on('signal', data => {
      const stringData = JSON.stringify(data);
      this.onSignal.next({ id: userId, data: stringData });
    });

    peer.on('stream', data => {
      this.onStream.next({ id: userId, data });
    });

    peer.on('connect', () => {
      this.onConnect.next({ id: userId, data: null });
    });

    peer.on('data', data => {
      this.onData.next({ id: userId, data });
    });
  }

  public signalPeer(userId: string, signal: string) {
    this.peers.get(userId).signal(JSON.parse(signal));
  }

  public sendMessageToAll(message: string) {
    this.peers.forEach(x => x.send(message));
  }

}
