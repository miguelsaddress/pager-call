import { Recipient } from "../common-types";

export interface SMSAdapter {
  notify(recipient: Recipient): void;
}
