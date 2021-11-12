import { MailAdapter } from "../../domain/adapters/mail.adapter";

export class TestMailAdapter implements MailAdapter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notify(_recipient: string): void {
    return;
  }
}
