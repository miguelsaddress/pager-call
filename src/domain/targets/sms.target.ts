import { Target } from "./target";

export class SMSTarget implements Target {
  constructor(private readonly phoneNumber: string) {}

  getRecipient(): string {
    return this.phoneNumber;
  }
}
