import { EscalationPolicy } from "../../domain/escalation-policy";
import { Level } from "../../domain/level";

describe("Escalation Policy", () => {
  describe("getNextLevel", () => {
    it("returns a level when invoked and there are levels left", () => {
      const policy = new EscalationPolicy("monitoredServiceId", [new Level()]);

      expect(policy.getNextLevel()).not.toBeUndefined();
    });

    it("returns undefined when no more levels left", () => {
      const policy = new EscalationPolicy("monitoredServiceId", [new Level()]);

      policy.getNextLevel();
      expect(policy.getNextLevel()).toBeUndefined();
    });
  });
});
