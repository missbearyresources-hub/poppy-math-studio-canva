import { useFeatureSupport } from "@canva/app-hooks";
import { Button, Checkbox, Rows, Text, Title } from "@canva/app-ui-kit";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import { useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import * as styles from "styles/components.css";

type Operation = "add" | "subtract" | "multiply" | "divide";
type Problem = { a: number; b: number; answer: number; symbol: string };
const symbols: Record<Operation, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};
const operations: Operation[] = ["add", "subtract", "multiply", "divide"];
const messages = defineMessages({
  add: {
    description: "Addition option and symbol",
    defaultMessage: "Addition +",
  },
  subtract: {
    description: "Subtraction option and symbol",
    defaultMessage: "Subtraction −",
  },
  multiply: {
    description: "Multiplication option and symbol",
    defaultMessage: "Multiplication ×",
  },
  divide: {
    description: "Division option and symbol",
    defaultMessage: "Division ÷",
  },
  title: { description: "App title", defaultMessage: "Poppy Math Studio V26" },
  intro: {
    description: "Introduction to the worksheet generator",
    defaultMessage: "Generate math practice and add it to your Canva design.",
  },
  operation: {
    description: "Operation picker label",
    defaultMessage: "Math operation",
  },
  count: {
    description: "Question count picker label",
    defaultMessage: "Questions",
  },
  range: {
    description: "Operand range picker label and limits",
    defaultMessage:
      "Maximum operand for addition and subtraction. Multiplication factors, division divisors, and quotients are capped at 12.",
  },
  generate: {
    description: "Generate button label",
    defaultMessage: "Generate Questions",
  },
  answers: {
    description: "Checkbox label for answer-key mode",
    defaultMessage: "Show answers (answer key preview)",
  },
  practice: {
    description: "Student worksheet preview heading",
    defaultMessage: "Math Practice",
  },
  worksheetTitle: {
    description: "Student worksheet Canva text heading",
    defaultMessage: "POPPY MATH STUDIO",
  },
  answerTitle: {
    description: "Answer key heading",
    defaultMessage: "ANSWER KEY",
  },
  name: {
    description: "Student name field in the preview",
    defaultMessage: "Name: ____________________",
  },
  nameDate: {
    description: "Student name and date fields in Canva",
    defaultMessage: "Name: ____________________  Date: __________",
  },
  adding: {
    description: "Canva insertion in progress",
    defaultMessage: "Adding…",
  },
  insert: {
    description: "Button for inserting into Canva",
    defaultMessage: "Add to Design",
  },
  unsupported: {
    description: "Hint for unsupported design types",
    defaultMessage: "This design does not support inserting text elements.",
  },
  success: {
    description: "Successful insertion feedback",
    defaultMessage: "Worksheet added to your Canva design.",
  },
  error: {
    description: "Failed insertion feedback",
    defaultMessage:
      "Could not add the worksheet. Try an editable Canva design.",
  },
  note: {
    description: "Description of the inserted text element",
    defaultMessage: "Adds a single editable text box to your design.",
  },
});
function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function makeProblems(
  operation: Operation,
  count: number,
  max: number,
): Problem[] {
  return Array.from({ length: count }, () => {
    let a = randomInt(0, max);
    let b = randomInt(0, max);
    if (operation === "subtract" && b > a) [a, b] = [b, a];
    if (operation === "multiply") {
      a = randomInt(0, Math.min(max, 12));
      b = randomInt(0, Math.min(max, 12));
    }
    if (operation === "divide") {
      b = randomInt(1, Math.min(max, 12));
      const quotient = randomInt(0, Math.min(max, 12));
      a = b * quotient;
    }
    const answer =
      operation === "add"
        ? a + b
        : operation === "subtract"
          ? a - b
          : operation === "multiply"
            ? a * b
            : a / b;
    return { a, b, answer, symbol: symbols[operation] };
  });
}
export const App = () => {
  const { formatMessage } = useIntl();
  const supports = useFeatureSupport();
  const addElement = [addElementAtPoint, addElementAtCursor].find((fn) =>
    supports(fn),
  );
  const [operation, setOperation] = useState<Operation>("add");
  const [count, setCount] = useState(10);
  const [max, setMax] = useState(10);
  const [problems, setProblems] = useState<Problem[]>(() =>
    makeProblems("add", 10, 10),
  );
  const [showAnswers, setShowAnswers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const lines = useMemo(
    () =>
      problems.map(
        (p, i) =>
          `${String(i + 1).padStart(2, " ")}.  ${p.a} ${p.symbol} ${p.b} = ${showAnswers ? p.answer : "_____"}`,
      ),
    [problems, showAnswers],
  );
  const generate = () => {
    setProblems(makeProblems(operation, count, max));
    setMessage("");
  };
  const addToDesign = async () => {
    if (!addElement || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await addElement({
        type: "text",
        children: [
          showAnswers
            ? formatMessage(messages.answerTitle) + "\n\n" + lines.join("\n")
            : [
                formatMessage(messages.worksheetTitle),
                formatMessage(messages.nameDate),
                "",
                ...lines,
              ].join("\n"),
        ],
      });
      setMessage(formatMessage(messages.success));
    } catch {
      setMessage(formatMessage(messages.error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={styles.scrollContainer} style={{ padding: 16 }}>
      <Rows spacing="2u">
        <Title size="small">{formatMessage(messages.title)}</Title>
        <Text>{formatMessage(messages.intro)}</Text>
        <label htmlFor="operation">{formatMessage(messages.operation)}</label>
        <select
          id="operation"
          value={operation}
          onChange={(e) => setOperation(e.target.value as Operation)}
          style={{ width: "100%", padding: 9 }}
        >
          {operations.map((op) => (
            <option key={op} value={op}>
              {formatMessage(messages[op])}
            </option>
          ))}
        </select>
        <label htmlFor="count">{formatMessage(messages.count)}</label>
        <select
          id="count"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ width: "100%", padding: 9 }}
        >
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <label htmlFor="range">{formatMessage(messages.range)}</label>
        <select
          id="range"
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          style={{ width: "100%", padding: 9 }}
        >
          {[5, 10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={generate} stretch>
          {formatMessage(messages.generate)}
        </Button>
        <Checkbox
          checked={showAnswers}
          onChange={(_, checked) => setShowAnswers(checked)}
          label={formatMessage(messages.answers)}
        />
        <div
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            background: "#fff",
            border: "1px solid #d9d9e0",
            borderRadius: 8,
            padding: 12,
            lineHeight: 1.8,
            maxHeight: 340,
            overflowY: "auto",
          }}
        >
          <strong>
            {formatMessage(
              showAnswers ? messages.answerTitle : messages.practice,
            )}
          </strong>
          {[
            "",
            ...(showAnswers ? [] : [formatMessage(messages.name)]),
            "",
            ...lines,
          ].join("\n")}
        </div>
        <Button
          variant="primary"
          onClick={addToDesign}
          disabled={!addElement || busy}
          stretch
        >
          {formatMessage(busy ? messages.adding : messages.insert)}
        </Button>
        {!addElement && <Text>{formatMessage(messages.unsupported)}</Text>}
        {message && <Text>{message}</Text>}
        <Text size="small">{formatMessage(messages.note)}</Text>
      </Rows>
    </div>
  );
};
