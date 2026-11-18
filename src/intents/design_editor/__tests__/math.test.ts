import { checkProblems, generateProblems, worksheetLines } from "../math";

describe("worksheet answer formatting", () => {
  it("reduces fraction sums and writes a whole number when appropriate", () => {
    const [problem] = generateProblems("fractionAdd", 1, 6, () => 0.99);
    if (!problem) throw new Error("Expected a question");
    expect(worksheetLines([problem], true)).toEqual(["1.  5/6 + 5/6 = 5/3"]);
    expect(
      worksheetLines(
        [
          {
            ...problem,
            left: 3,
            right: 3,
            answer: 6,
            display: "3/6 + 3/6 = _____",
          },
        ],
        true,
      ),
    ).toEqual(["1.  3/6 + 3/6 = 1"]);
  });

  it("adds and subtracts integer hundredths exactly", () => {
    let index = 0;
    const random = () => [0.295, 0.095][index++ % 2] ?? 0;
    const sum = generateProblems("decimalAdd", 1, 100, random);
    const difference = generateProblems("decimalSubtract", 1, 100, random);
    expect(checkProblems([...sum, ...difference])).toBe(true);
    expect(worksheetLines(sum, true)).toEqual(["1.  0.30 + 0.10 = 0.40"]);
    expect(worksheetLines(difference, true)).toEqual([
      "1.  0.30 − 0.10 = 0.20",
    ]);
  });
});
