import { Alert } from "../alert";
import { MonitoredServiceId } from "../common-types";

export interface Alertable {
  receive(alert: Alert): void;
}

export interface TimerAdapter {
  addTimeout(alertable: Alertable, alert: Alert, minutes: number): void;
  removeTimeout(
    alertable: Alertable,
    monitoredServiceId: MonitoredServiceId
  ): void;
}
