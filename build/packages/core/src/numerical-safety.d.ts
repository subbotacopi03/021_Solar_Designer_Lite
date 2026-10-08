export declare class CalculationRangeError extends RangeError {
    readonly path: string;
    constructor(path: string);
}
/** Keep unrepresentable arithmetic distinct from missing-data nulls in JSON. */
export declare function assertFiniteCalculation<T>(result: T): T;
