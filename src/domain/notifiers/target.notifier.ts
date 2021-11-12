import { MailAdapter } from "../adapters/mail.adapter";
import { SMSAdapter } from "../adapters/sms.adapter";
import { Target } from "../targets/target";
import { Notifier } from "./notifier";

export class TargetNotifier implements Notifier {
  constructor(
    private readonly mailAdapter: MailAdapter,
    private readonly smsAdapter: SMSAdapter
  ) {}

  notify(target: Target): void {
    switch (target.constructor.name) {
      case "EmailTarget":
        this.mailAdapter.notify(target.getRecipient());
        break;
      case "SMSTarget":
        this.smsAdapter.notify(target.getRecipient());
        break;
      default:
        throw new Error(
          `Cannot notify, unsupported Target type [${target.constructor.name}]`
        );
    }
  }
}
