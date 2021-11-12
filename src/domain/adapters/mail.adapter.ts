import { Recipient } from "../common-types";

export interface MailAdapter {
  notify(recipient: Recipient): void;
}
