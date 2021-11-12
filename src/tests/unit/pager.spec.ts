import { Alert } from "../../domain/alert";
import { EscalationPolicy } from "../../domain/escalation-policy";

import { Notifier } from "../../domain/notifiers/notifier";
import { TargetNotifier } from "../../domain/notifiers/target.notifier";
import { Pager } from "../../domain/pager";
import { TestMailAdapter } from "../test-doubles/test.mail.adapter";
import { TestSMSAdapter } from "../test-doubles/test.sms.adapter";
import { TestTimerAdapter } from "../test-doubles/test.timer.adapter";

describe("Pager", () => {
  const notifier: Notifier = new TargetNotifier(
    new TestMailAdapter(),
    new TestSMSAdapter()
  );
  const timerAdapter = new TestTimerAdapter();
  const sampleDummyAlert = new Alert("monitoredServiceId", "not important");

  const pager: Pager = new Pager(notifier, timerAdapter);

  describe("receive", () => {
    test("when a monitored service id does not have any policy associated to it, the pager throws an error with the right message if an alert is sent", () => {
      expect(() => pager.receive(sampleDummyAlert)).toThrow(Error);
      expect(() => pager.receive(sampleDummyAlert)).toThrow(
        `The service [${sampleDummyAlert.getMonitoredServiceId()}] is not monitored by this pager policies`
      );
    });

    test("the pager does not notify if no next targets are found", () => {
      const policyNoMoreLevels = new EscalationPolicy("monitoredServiceId", []);
      pager.addEscalationPolicy(policyNoMoreLevels);

      const notifierSpy = jest.spyOn(notifier, "notify");
      pager.receive(sampleDummyAlert);

      expect(notifierSpy).not.toHaveBeenCalled();

      notifierSpy.mockClear();
    });

    test("the pager does not set a timer if no next targets are found", () => {
      const policyNoMoreLevels = new EscalationPolicy("monitoredServiceId", []);
      pager.addEscalationPolicy(policyNoMoreLevels);

      const timerSpy = jest.spyOn(timerAdapter, "addTimeout");
      pager.receive(sampleDummyAlert);

      expect(timerSpy).not.toHaveBeenCalled();
      timerSpy.mockClear();
    });
  });
});
