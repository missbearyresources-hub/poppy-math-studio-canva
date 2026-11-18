import { worksheetPage } from "../worksheet_page";

describe("formatted Canva worksheet", () => {
  it("keeps 40 editable questions inside a two-column Letter layout", () => {
    const dimensions = { width: 816, height: 1056 };
    const lines = Array.from(
      { length: 40 },
      (_, index) => `${index + 1}. 144 ÷ 12 = _____`,
    );
    const elements = worksheetPage(
      dimensions,
      "Math Practice",
      ["Name", "Solve each problem."],
      lines,
      2,
    );
    const questions = elements.slice(3);
    expect(
      questions.map((element) =>
        element.type === "text" ? element.children : undefined,
      ),
    ).toEqual(lines.map((line) => [line]));
    expect(new Set(questions.map(({ left }) => left)).size).toBe(2);
    for (const element of elements) {
      expect(element.left + Number(element.width ?? 0)).toBeLessThan(
        dimensions.width,
      );
      expect(
        element.top + (element.type === "text" ? (element.fontSize ?? 0) : 0),
      ).toBeLessThan(dimensions.height);
    }
  });
});
