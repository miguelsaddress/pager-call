import { MonitoredServiceId } from "./common-types";

export class Alert {
  constructor(
    private readonly monitoredServiceId: MonitoredServiceId,
    private readonly message: string
  ) {}

  getMonitoredServiceId(): MonitoredServiceId {
    return this.monitoredServiceId;
  }

  getMessage(): string {
    return this.message;
  }
}
