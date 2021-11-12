import { MonitoredServiceId } from "./common-types";
import { Level } from "./level";

export class EscalationPolicy {
  private currentLevel: number;

  constructor(
    private readonly monitoredServiceId: MonitoredServiceId,
    private readonly levels: Level[] = []
  ) {
    this.currentLevel = 0;
  }

  getMonitoredServiceId(): MonitoredServiceId {
    return this.monitoredServiceId;
  }

  /**
   * Get next policy level of targets if any
   * @returns
   */
  getNextLevel(): Level | undefined {
    return this.levels[this.currentLevel++];
  }

  /**
   * Adds a level to the escalation policy and returns the
   * position of that level in the escalation policy
   * @param level
   * @returns
   */
  addLevel(level: Level): number {
    return this.levels.push(level);
  }
}
