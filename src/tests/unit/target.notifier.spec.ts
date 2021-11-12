import { Notifier } from "../../domain/notifiers/notifier";
import { TargetNotifier } from "../../domain/notifiers/target.notifier";
import { EmailTarget } from "../../domain/targets/email.target";
import { SMSTarget } from "../../domain/targets/sms.target";
import { Target } from "../../domain/targets/target";
import { TestMailAdapter } from "../test-doubles/test.mail.adapter";
import { TestSMSAdapter } from "../test-doubles/test.sms.adapter";

describe("TargetNotifier", () => {
  describe("notify", () => {
    const mailAdapter = new TestMailAdapter();
    const smsAdapter = new TestSMSAdapter();
    const notifier: Notifier = new TargetNotifier(mailAdapter, smsAdapter);

    const mailAdapterSpy = jest.spyOn(mailAdapter, "notify");
    const smsAdapterSpy = jest.spyOn(smsAdapter, "notify");
    afterEach(() => {
      mailAdapterSpy.mockClear();
      smsAdapterSpy.mockClear();
    });

    it("uses mailAdapter for EmailTarget targets", () => {
      notifier.notify(new EmailTarget("mail address here"));
      expect(mailAdapterSpy).toHaveBeenCalledTimes(1);
      expect(smsAdapterSpy).not.toHaveBeenCalled();
    });

    it("smsAdapter for SMSTarget targets", () => {
      notifier.notify(new SMSTarget("phone number here"));
      expect(smsAdapterSpy).toHaveBeenCalledTimes(1);
      expect(mailAdapterSpy).not.toHaveBeenCalled();
    });

    it("throws Error with expected message if the target type is unknown", () => {
      class UnknownTarget implements Target {
        getRecipient(): string {
          return "recipient";
        }
      }

      expect(() => notifier.notify(new UnknownTarget())).toThrow(Error);
      expect(() => notifier.notify(new UnknownTarget())).toThrow(
        "Cannot notify, unsupported Target type [UnknownTarget]"
      );
    });
  });
});
