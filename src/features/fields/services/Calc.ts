

export class Calc {
  public static yield({
    areaHarvested,
    avgBagWeightKg,
    bagsHarvested
  }: {
    areaHarvested: number;
    avgBagWeightKg: number;
    bagsHarvested: number;
  }) {
    if (areaHarvested <= 0 || avgBagWeightKg <= 0 || bagsHarvested < 0) {
        throw new Error("Invalid input: All values must be positive numbers.");
    }

    const totalWeight = avgBagWeightKg * bagsHarvested;
    const yieldPerHa = totalWeight / areaHarvested;
    return Math.round(yieldPerHa)
  }

  private constructor() {}
}
