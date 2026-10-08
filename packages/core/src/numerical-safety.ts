export class CalculationRangeError extends RangeError {
  constructor(public readonly path: string) {
    super(
      `Calculation exceeds numeric range at ${path}; no result was produced.`,
    );
    this.name = "CalculationRangeError";
  }
}

/** Keep unrepresentable arithmetic distinct from missing-data nulls in JSON. */
export function assertFiniteCalculation<T>(result: T): T {
  function visit(value: unknown, path: string): void {
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new CalculationRangeError(path);
    }
    if (value !== null && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        visit(child, `${path}.${key}`);
      }
    }
  }
  visit(result, "result");
  return result;
}
