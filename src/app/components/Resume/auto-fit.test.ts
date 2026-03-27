import {
  findBestFitScale,
  getAutoFitScaleBounds,
} from "components/Resume/auto-fit";

describe("auto-fit search", () => {
  it("searches for the largest single-page scale", async () => {
    const result = await findBestFitScale({
      minScale: 0.75,
      maxScale: 1.2,
      measurePageCount: async (scale) => (scale <= 1.08 ? 1 : 2),
    });

    expect(result.fitStatus).toBe("applied");
    expect(result.scale).toBeGreaterThan(1.07);
    expect(result.scale).toBeLessThanOrEqual(1.08);
  });

  it("backs off when the chosen scale still overflows after the search", async () => {
    const measuredScales: number[] = [];
    const result = await findBestFitScale({
      minScale: 0.75,
      maxScale: 1,
      measurePageCount: async (scale) => {
        measuredScales.push(scale);
        return scale >= 0.902 ? 2 : 1;
      },
    });

    expect(result.fitStatus).toBe("applied");
    expect(result.scale).toBeLessThan(0.902);
    expect(result.scale).toBeGreaterThanOrEqual(0.897);
    expect(measuredScales.some((scale) => scale > result.scale)).toBe(true);
    expect(measuredScales).toContain(result.scale);
  });

  it("returns overflowAtLimit when the minimum readable layout still spills", async () => {
    const result = await findBestFitScale({
      minScale: 0.75,
      maxScale: 1,
      measurePageCount: async () => 2,
    });

    expect(result).toEqual({
      scale: 0.75,
      fitStatus: "overflowAtLimit",
    });
  });

  it("keeps the base scale when the current layout already fits on one page", async () => {
    const bounds = getAutoFitScaleBounds(8);
    const result = await findBestFitScale({
      ...bounds,
      measurePageCount: async () => 1,
    });

    expect(result.fitStatus).toBe("applied");
    expect(result.scale).toBe(1);
  });
});
