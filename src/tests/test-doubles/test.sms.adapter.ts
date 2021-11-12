import { SMSAdapter } from "../../domain/adapters/sms.adapter";

export class TestSMSAdapter implements SMSAdapter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notify(_recipient: string): void {
    return;
  }
}
