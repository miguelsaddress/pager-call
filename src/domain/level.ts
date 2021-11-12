import { Target } from "./targets/target";

export class Level {
  constructor(private readonly targets: Target[] = []) {}

  addTarget(t: Target): void {
    this.targets.push(t);
  }

  getTargets(): Target[] {
    return this.targets;
  }
}
