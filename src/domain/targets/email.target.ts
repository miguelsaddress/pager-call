import { Target } from "./target";

export class EmailTarget implements Target {
  constructor(private readonly emailAddress: string) {}

  getRecipient(): string {
    return this.emailAddress;
  }
}
