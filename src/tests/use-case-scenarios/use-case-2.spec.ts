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
 * Given a Monitored Service in an Unhealthy State,
 * the corresponding Alert is not Acknowledged
 * and the last level has not been notified,
 * when the Pager receives the Acknowledgement Timeout,
 * then the Pager notifies all targets of the next level of the escalation policy
 * and sets a 15-minutes acknowledgement delay.
 */
describe("Use case 2: Given a Monitored Service in an Unhealthy State, the corresponding Alert is not Acknowledged and the last level has not been notified", () => {
  const mailAdapter = new TestMailAdapter();
  const smsAdapter = new TestSMSAdapter();
  const timerAdapter = new TestTimerAdapter();
  const notifier: Notifier = new TargetNotifier(mailAdapter, smsAdapter);
  const monitoredServiceId = "monitoredServiceId";
  const sampleDummyAlert = new Alert(monitoredServiceId, "not important");

  let pager: Pager;
  let notifierSpy: jest.SpyInstance<void, Target[]>;
  // let pagerReceiveSpy: jest.SpyInstance<void, Alert[]>
  let timerMock: jest.SpyInstance<void, [Alertable, Alert, number]>;

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

    notifierSpy = jest.spyOn(notifier, "notify");
    // pagerReceiveSpy = jest.spyOn(pager, 'receive')
    timerMock = jest.spyOn(timerAdapter, "addTimeout").mockImplementationOnce(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (alertable: Alertable, alert: Alert, _minutes: number) => {
        alertable.receive(alert);
      }
    );

    // Set service to unhealthy state and trigger notification to first level
    // and not ack given of the alert.
    // REMEMBER: this triggers first notification rounds and first call to timer
    pager.receive(sampleDummyAlert);
    expect(pager.isServiceUnhealthy(monitoredServiceId)).toBeTruthy();
  });

  describe("when the Pager receives the Acknowledgement Timeout", () => {
    it("notifies all targets of the next level", () => {
      const TOTAL_NOTIFICATIONS_ALL_LEVELS = 3;
      expect(notifierSpy).toHaveBeenCalledTimes(TOTAL_NOTIFICATIONS_ALL_LEVELS);

      const LAST_NOTIFICATION_INDEX = TOTAL_NOTIFICATIONS_ALL_LEVELS - 1;
      const callRecipient: string =
        notifierSpy.mock.calls[LAST_NOTIFICATION_INDEX][0].getRecipient();
      expect(callRecipient).toEqual("mail2@example.org");

      notifierSpy.mockClear();
      // pagerReceiveSpy.mockClear()
      timerMock.mockClear();
    });

    it("sets a 15-minutes acknowledgement delay", () => {
      const [, , minutes] = timerMock.mock.calls[0];

      expect(minutes).toEqual(15);
      timerMock.mockClear();
    });
  });
});
