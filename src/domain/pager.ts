import { Alertable, TimerAdapter } from "./adapters/timer.adapter";
import { Alert } from "./alert";
import { MonitoredServiceId, Recipient } from "./common-types";
import { EscalationPolicy } from "./escalation-policy";
import { Notifier } from "./notifiers/notifier";
import { Target } from "./targets/target";

export class Pager implements Alertable {
  private readonly escalationPolicies: EscalationPolicy[] = [];
  private readonly unhealthyServices: Record<MonitoredServiceId, Recipient[]> =
    {};

  constructor(
    private readonly targetNotifier: Notifier,
    private readonly timer: TimerAdapter
  ) {}

  /**
   * Adds the given escalation policy to the pager and returns
   * the number of policies managed by the pager
   * @param escalationPolicy
   * @returns
   */
  addEscalationPolicy(escalationPolicy: EscalationPolicy): number {
    return this.escalationPolicies.push(escalationPolicy);
  }

  markAsHealthy(monitoredServiceId: MonitoredServiceId): void {
    if (this.unhealthyServices[monitoredServiceId] === undefined) {
      throw new Error(
        `The given monitored service Id [${monitoredServiceId}] is not registered in the pager service as unhealthy`
      );
    }

    // This is like 'cascade deleting' also the targets that were notified,
    // so they are available to more notifications later
    delete this.unhealthyServices[monitoredServiceId];

    // Avoid new alert reminders once it's solved
    this.timer.removeTimeout(this, monitoredServiceId);
  }

  markAsUnhealthy(monitoredServiceId: MonitoredServiceId): void {
    // This method is not really needed or requested, but besides allowing a more
    // descriptive code when used, it will help us testing. I am aware that these
    // kind of 'tricks' should be kept to a minimum
    if (this.unhealthyServices[monitoredServiceId] === undefined) {
      this.unhealthyServices[monitoredServiceId] = [];
    }
  }

  receive(alert: Alert): void {
    const policy = this.findPolicyOrError(alert);
    const nextLevelTargets = this.getNextLevelTargets(policy);
    const targetsToNotify = this.getTargetsToNotify(alert, nextLevelTargets);

    const notificationsCount = this.notifyTargets(
      alert.getMonitoredServiceId(),
      targetsToNotify
    );

    /**
     * There is a decision made here:
     * When there are no more targets to notify, no timeout is sent
     * because all the policy levels have been reached. Other solution
     * could be to keep notifying some targets, or all targets, but
     * then it requires thinking the new timeout amount of minutes, who
     * is going to be notified in that case, etc. So I kept the simplest
     * scenario I could imagine
     * */
    if (notificationsCount > 0) {
      this.setTimerForAlert(alert);
    }
  }

  isServiceUnhealthy(monitoredServiceId: MonitoredServiceId): boolean {
    return this.unhealthyServices[monitoredServiceId] !== undefined;
  }

  private findPolicyOrError(alert: Alert): EscalationPolicy {
    const policy = this.escalationPolicies.find(
      (ep: EscalationPolicy) =>
        ep.getMonitoredServiceId() === alert.getMonitoredServiceId()
    );
    if (policy === undefined) {
      throw new Error(
        `The service [${alert.getMonitoredServiceId()}] is not monitored by this pager policies`
      );
    }
    return policy;
  }

  private getNextLevelTargets(policy: EscalationPolicy): Target[] {
    const policyNextLevel = policy.getNextLevel();

    /**
     * Another option could be throwing an error/exception, but there is little we can do
     * in that case. If we run out of new targets, we simply do not notify anybody else
     */

    return policyNextLevel?.getTargets() || [];
  }

  private getTargetsToNotify(alert: Alert, levelTargets: Target[]): Target[] {
    this.markAsUnhealthy(alert.getMonitoredServiceId());
    const alreadyNotified =
      this.unhealthyServices[alert.getMonitoredServiceId()];
    // We cannot notify twice to the same recipients alerted by a service
    const targetsToNotify = levelTargets.filter(
      (t) => !alreadyNotified.includes(t.getRecipient())
    );
    return targetsToNotify;
  }

  private notifyTargets(
    monitoredServiceId: MonitoredServiceId,
    targetsToNotify: Target[]
  ): number {
    targetsToNotify.forEach((t) => this.targetNotifier.notify(t));
    this.setTargetsAsNotifiedForService(monitoredServiceId, targetsToNotify);
    const notifiedTargetsCount = targetsToNotify.length;
    return notifiedTargetsCount;
  }

  private setTargetsAsNotifiedForService(
    monitoredServiceId: MonitoredServiceId,
    targetsToNotify: Target[]
  ) {
    const newRecipients = targetsToNotify.map((t) => t.getRecipient());
    const newList =
      this.unhealthyServices[monitoredServiceId].concat(newRecipients);
    this.unhealthyServices[monitoredServiceId] = newList;
  }

  private setTimerForAlert(alert: Alert): void {
    this.timer.addTimeout(this, alert, 15);
  }
}

// import * as crypto from 'crypto'

// enum MonitoredServiceState {
//   Healthy = 'Healthy',
//   Unhealthy = 'Unhealthy'
// }

// export class MonitoredService {
//   private id: string
//   private state: MonitoredServiceState

//   constructor() {
//     this.id = crypto.randomUUID()
//     this.state = MonitoredServiceState.Healthy
//   }

//   getId(): string {
//     return this.id
//   }

//   getState(): MonitoredServiceState {
//     return this.state
//   }

//   becomeUnhealthy() {
//     this.state = MonitoredServiceState.Unhealthy
//   }

//   becomeHealthy() {
//     this.state = MonitoredServiceState.Healthy
//   }
// }
