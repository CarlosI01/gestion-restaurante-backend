import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ReceptionSseService {
  private readonly events = new Subject<MessageEvent>();
  subscribe(): Observable<MessageEvent> { return this.events.asObservable(); }
  private emit(type: string, data: object | string): void { this.events.next({ type, data }); }
  // private emit(type: string, data: object | string): void {
  //   this.events.next({ type, data });
  // }
  notifyNewOrder(payload: any): void { this.emit('NEW_ORDER', payload); }
  emitOrderUpdated(payload: any): void { this.emit('ORDER_UPDATED', payload); }
  emitTableSessionUpdated(payload: any): void { this.emit('TABLE_SESSION_UPDATED', payload); }
  emitTableStatusUpdated(payload: any): void { this.emit('TABLE_STATUS_UPDATED', payload); }
  emitDashboardUpdated(payload: any): void { this.emit('DASHBOARD_UPDATED', payload); }
}
