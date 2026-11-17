import { useFeatureSupport } from "@canva/app-hooks";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import { fireEvent, waitFor } from "@testing-library/react";
import { App } from "../app";
import { renderInTestProvider } from "../../../utils/test_render";

jest.mock("@canva/app-hooks");

describe("Poppy Math Studio", () => {
  const supports = jest.fn();
  const insertion = jest.mocked(addElementAtPoint);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useFeatureSupport).mockReturnValue(supports);
    supports.mockImplementation((feature) => feature === addElementAtPoint);
  });

  it.each([
    ["add", "+", (a: number, b: number) => a + b],
    ["subtract", "−", (a: number, b: number) => a - b],
    ["multiply", "×", (a: number, b: number) => a * b],
    ["divide", "÷", (a: number, b: number) => a / b],
  ] as const)(
    "generates %s questions with matching answers",
    (operation, symbol, solve) => {
      const view = renderInTestProvider(<App />);
      fireEvent.change(view.getByLabelText("Math operation"), {
        target: { value: operation },
      });
      fireEvent.change(view.getByLabelText("Questions"), {
        target: { value: "40" },
      });
      fireEvent.change(view.getByLabelText(/^Maximum operand/), {
        target: { value: "5" },
      });
      fireEvent.click(view.getByRole("button", { name: "Generate Questions" }));
      const preview = view.getByText("Math Practice").parentElement;
      const questions = Array.from(
        (preview?.textContent ?? "").matchAll(/(\d+) ([+−×÷]) (\d+) = _____/g),
      );
      expect(questions).toHaveLength(40);

      fireEvent.click(view.getByRole("checkbox", { name: /Show answers/ }));
      const answers = Array.from(
        (preview?.textContent ?? "").matchAll(/(\d+) ([+−×÷]) (\d+) = (\d+)/g),
      );
      expect(answers).toHaveLength(40);
      answers.forEach(([equation, a, operator, b, answer], index) => {
        expect(equation.replace(/= \d+$/, "= _____")).toBe(
          questions[index]?.[0],
        );
        expect(operator).toBe(symbol);
        expect(Number(b)).toBeLessThanOrEqual(5);
        const expected = solve(Number(a), Number(b));
        expect(Number.isInteger(expected)).toBe(true);
        expect(expected).toBeGreaterThanOrEqual(0);
        expect(Number(answer)).toBe(expected);
        expect(Number(b)).toBeGreaterThanOrEqual(
          operation === "divide" ? 1 : 0,
        );
        expect(
          operation === "divide" ? expected : Number(a),
        ).toBeLessThanOrEqual(5);
      });
    },
  );

  it("inserts editable student and answer-key text using the supported SDK method", async () => {
    const view = renderInTestProvider(<App />);
    const previewAnswers = view.getByRole("checkbox", { name: /Show answers/ });
    fireEvent.click(previewAnswers);
    fireEvent.click(view.getByRole("button", { name: "Add to Design" }));
    await view.findByText("Worksheet added to your Canva design.");
    const worksheet = insertion.mock.calls[0]?.[0];
    expect(worksheet).toEqual({
      type: "text",
      children: [expect.stringContaining("Name:")],
    });
    expect(JSON.stringify(worksheet)).toContain(" = _____");

    fireEvent.click(previewAnswers);
    fireEvent.click(view.getByRole("button", { name: "Add Answer Key" }));
    await waitFor(() => expect(insertion).toHaveBeenCalledTimes(2));
    await view.findByText("Answer key added to your Canva design.");
    const key = insertion.mock.calls[1]?.[0];
    expect(key).toEqual({
      type: "text",
      children: [expect.stringMatching(/^ANSWER KEY\n\n[\s\S]+ = \d/)],
    });
    expect(JSON.stringify(key)).not.toContain("_____");
    expect(addElementAtCursor).not.toHaveBeenCalled();
  });

  it("uses cursor insertion when point insertion is unavailable and reports SDK failure", async () => {
    supports.mockImplementation((feature) => feature === addElementAtCursor);
    jest
      .mocked(addElementAtCursor)
      .mockRejectedValueOnce(new Error("Insertion failed"));
    const view = renderInTestProvider(<App />);
    fireEvent.click(view.getByRole("button", { name: "Add to Design" }));
    await view.findByText(/Could not add the worksheet/);
    expect(addElementAtCursor).toHaveBeenCalledTimes(1);
    expect(insertion).not.toHaveBeenCalled();
  });

  it("disables insertion when neither SDK method is supported", () => {
    supports.mockReturnValue(false);
    const view = renderInTestProvider(<App />);
    expect(
      view
        .getByRole("button", { name: "Add to Design" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });
});
