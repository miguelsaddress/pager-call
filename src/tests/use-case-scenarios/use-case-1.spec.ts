import { Alert } from "../../domain/alert";
import { EscalationPolicy } from "../../domain/escalation-policy";
import { Level } from "../../domain/level";
import { Notifier } from "../../domain/notifiers/notifier";
import { TargetNotifier } from "../../domain/notifiers/target.notifier";
import { Pager } from "../../domain/pager";
import { EmailTarget } from "../../domain/targets/email.target";
import { SMSTarget } from "../../domain/targets/sms.target";
import { TestMailAdapter } from "../test-doubles/test.mail.adapter";
import { TestSMSAdapter } from "../test-doubles/test.sms.adapter";
import { TestTimerAdapter } from "../test-doubles/test.timer.adapter";

/**
 * Given a Monitored Service in a Healthy State,
 * when the Pager receives an Alert related to this Monitored Service,
 * then the Monitored Service becomes Unhealthy,
 * the Pager notifies all targets of the first level of the escalation policy,
 * and sets a 15-minutes acknowledgement delay
 */

describe("Use case 1: Given a Monitored Service in a Healthy State", () => {
  const mailAdapter = new TestMailAdapter();
  const smsAdapter = new TestSMSAdapter();
  const timerAdapter = new TestTimerAdapter();
  const notifier: Notifier = new TargetNotifier(mailAdapter, smsAdapter);
  const monitoredServiceId = "monitoredServiceId";
  const sampleDummyAlert = new Alert(monitoredServiceId, "not important");

  let pager: Pager;

  describe("Pager receives an Alert related to this Monitored Service", () => {
    beforeEach(() => {
      pager = new Pager(notifier, timerAdapter);
      const policy = new EscalationPolicy(monitoredServiceId, [
        new Level([
          new EmailTarget("mail@example.org"),
          new SMSTarget("666 55 44 33"),
        ]),
        new Level([new EmailTarget("mail2@example.org")]),
      ]);

      pager.addEscalationPolicy(policy);
    });

    it("the Monitored Service is NOT Unhealthy if never alerted before", () => {
      expect(pager.isServiceUnhealthy(monitoredServiceId)).toBeFalsy();
    });

    it("the Monitored Service becomes Unhealthy", () => {
      pager.receive(sampleDummyAlert);
      expect(pager.isServiceUnhealthy(monitoredServiceId)).toBeTruthy();
    });

    it("notifies all targets of the first level of the escalation policy", () => {
      const notifierSpy = jest.spyOn(notifier, "notify");
      pager.receive(sampleDummyAlert);

      const callRecipients: string[] = [
        notifierSpy.mock.calls[0][0].getRecipient(),
        notifierSpy.mock.calls[1][0].getRecipient(),
      ];

      expect(notifierSpy).toHaveBeenCalledTimes(2);
      expect(callRecipients).toContain("mail@example.org");
      expect(callRecipients).toContain("666 55 44 33");
      expect(callRecipients).not.toContain("mail2@example.org");

      notifierSpy.mockClear();
    });

    it("sets a 15-minutes acknowledgement delay", () => {
      const timerSpy = jest.spyOn(timerAdapter, "addTimeout");
      pager.receive(sampleDummyAlert);

      const [, , minutes] = timerSpy.mock.calls[0];

      expect(timerSpy).toHaveBeenCalledTimes(1);
      expect(minutes).toEqual(15);
      timerSpy.mockClear();
    });
  });

  it("monitored service id without policy throws error with the right message is alert is sent", () => {
    pager = new Pager(notifier, timerAdapter);
    expect(() => pager.receive(sampleDummyAlert)).toThrow(Error);
    expect(() => pager.receive(sampleDummyAlert)).toThrow(
      `The service [${sampleDummyAlert.getMonitoredServiceId()}] is not monitored by this pager policies`
    );
  });
});
