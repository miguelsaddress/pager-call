/* eslint-disable @typescript-eslint/no-unused-vars */
import { Alertable, TimerAdapter } from "../../domain/adapters/timer.adapter";
import { Alert } from "../../domain/alert";

export class TestTimerAdapter implements TimerAdapter {
  addTimeout(_alertable: Alertable, _alert: Alert, _minutes: number): void {
    return;
  }
  removeTimeout(_alertable: Alertable, _monitoredServiceId: string): void {
    return;
  }
}
