import { Alertable } from "../../domain/adapters/timer.adapter";
import { Alert } from "../../domain/alert";
import { EscalationPolicy } from "../../domain/escalation-policy";
import { Level } from "../../domain/level";
import { Notifier } from "../../domain/notifiers/notifier";
import { TargetNotifier } from "../../domain/notifiers/target.notifier";
import { Pager } from "../../domain/pager";
import { EmailTarget } from "../../domain/targets/email.target";
import { SMSTarget } from "../../domain/targets/sms.target";
import { Target } from "../../domain/targets/target";
import { TestMailAdapter } from "../test-doubles/test.mail.adapter";
import { TestSMSAdapter } from "../test-doubles/test.sms.adapter";
import { TestTimerAdapter } from "../test-doubles/test.timer.adapter";

/**
 * Given a Monitored Service in an Unhealthy State
 * when the Pager receives the Acknowledgement
 * and later receives the Acknowledgement Timeout,
 * then the Pager doesn't notify any Target
 * and doesn't set an acknowledgement delay.
 */
describe("Use case 3: Given a Monitored Service in an Unhealthy State", () => {
  const mailAdapter = new TestMailAdapter();
  const smsAdapter = new TestSMSAdapter();
  const timerAdapter = new TestTimerAdapter();
  const notifier: Notifier = new TargetNotifier(mailAdapter, smsAdapter);
  const monitoredServiceId = "monitoredServiceId";

  let pager: Pager;
  let notifierSpy: jest.SpyInstance<void, Target[]>;
  let timerSpy: jest.SpyInstance<void, [Alertable, Alert, number]>;

  beforeEach(() => {
    // Set the described scenario
    pager = new Pager(notifier, timerAdapter);
    const policy = new EscalationPolicy(monitoredServiceId, [
      new Level([
        new EmailTarget("mail@example.org"),
        new SMSTarget("666 55 44 33"),
      ]),
      new Level([new EmailTarget("mail2@example.org")]),
    ]);
    pager.addEscalationPolicy(policy);
    pager.markAsUnhealthy(monitoredServiceId);

    notifierSpy = jest.spyOn(notifier, "notify");
    timerSpy = jest.spyOn(timerAdapter, "addTimeout");

    expect(pager.isServiceUnhealthy(monitoredServiceId)).toBeTruthy();
  });

  describe("when the Pager receives the Acknowledgement and later receives the Acknowledgement Timeout", () => {
    it("doesn't notify any Target", () => {
      pager.markAsHealthy(monitoredServiceId);
      expect(notifierSpy).not.toHaveBeenCalled();

      notifierSpy.mockClear();
      timerSpy.mockClear();
    });

    it("doesn't set an acknowledgement delay", () => {
      expect(timerSpy).not.toHaveBeenCalled();

      notifierSpy.mockClear();
      timerSpy.mockClear();
    });
  });
});
