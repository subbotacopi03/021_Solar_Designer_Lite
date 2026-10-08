export class CalculationRangeError extends RangeError {
    path;
    constructor(path) {
        super(`Calculation exceeds numeric range at ${path}; no result was produced.`);
        this.path = path;
        this.name = "CalculationRangeError";
    }
}
/** Keep unrepresentable arithmetic distinct from missing-data nulls in JSON. */
export function assertFiniteCalculation(result) {
    function visit(value, path) {
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
//# sourceMappingURL=numerical-safety.js.map