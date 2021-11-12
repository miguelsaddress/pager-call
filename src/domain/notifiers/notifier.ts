import { Target } from "../targets/target";

export interface Notifier {
  notify(target: Target): void;
}
