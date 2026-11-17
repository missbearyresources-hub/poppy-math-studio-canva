export type Operation = "add" | "subtract" | "multiply" | "divide";
export type Problem = {
  id: number;
  left: number;
  right: number;
  operation: Operation;
  answer: number;
  display: string;
};
const symbols: Record<Operation, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};
function integer(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}
function randomInt(min: number, max: number, random: () => number): number {
  const n = random();
  if (!Number.isFinite(n) || n < 0 || n >= 1)
    throw new Error("Random source must return a value in [0, 1)");
  return min + Math.floor(n * (max - min + 1));
}
export function generateProblems(
  operation: Operation,
  count: number,
  maxNumber: number,
  random: () => number = Math.random,
): Problem[] {
  const safeCount = integer(count, 1, 40);
  const max = integer(maxNumber, 2, 100);
  const output: Problem[] = [];
  const limit =
    operation === "multiply" || operation === "divide"
      ? Math.min(max, 12)
      : max;
  for (let i = 0; i < safeCount; i++) {
    let a = randomInt(1, limit, random);
    let b = randomInt(1, limit, random);
    let answer: number;
    switch (operation) {
      case "add":
        answer = a + b;
        break;
      case "subtract":
        [a, b] = [Math.max(a, b), Math.min(a, b)];
        answer = a - b;
        break;
      case "multiply":
        answer = a * b;
        break;
      case "divide":
        answer = a;
        a = b * answer;
        break;
      default:
        throw new Error("Unsupported operation");
    }
    output.push({
      id: i + 1,
      left: a,
      right: b,
      operation,
      answer,
      display: `${a} ${symbols[operation]} ${b} = _____`,
    });
  }
  return output;
}
export function checkProblems(problems: Problem[]): boolean {
  return problems.every((p) =>
    p.operation === "add"
      ? p.left + p.right === p.answer
      : p.operation === "subtract"
        ? p.left - p.right === p.answer && p.answer >= 0
        : p.operation === "multiply"
          ? p.left * p.right === p.answer
          : p.right !== 0 &&
            p.left / p.right === p.answer &&
            Number.isInteger(p.answer),
  );
}
export function worksheetLines(
  problems: Problem[],
  answers: boolean,
): string[] {
  return problems.map(
    (p) =>
      `${p.id}.  ${answers ? `${p.left} ${symbols[p.operation]} ${p.right} = ${p.answer}` : p.display}`,
  );
}
