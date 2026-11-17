import { useFeatureSupport } from "@canva/app-hooks";
import { Button, Rows, Text } from "@canva/app-ui-kit";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import { useMemo, useState } from "react";
import * as styles from "styles/components.css";

type Operation = "add" | "subtract" | "multiply" | "divide";
type Problem = { a: number; b: number; answer: number; symbol: string };
const symbols: Record<Operation, string> = {
  add: "+", subtract: "−", multiply: "×", divide: "÷",
};
const operations: { key: Operation; label: string }[] = [
  { key: "add", label: "Addition +" },
  { key: "subtract", label: "Subtraction −" },
  { key: "multiply", label: "Multiplication ×" },
  { key: "divide", label: "Division ÷" },
];
function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function makeProblems(operation: Operation, count: number, max: number): Problem[] {
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
    const answer = operation === "add" ? a + b
      : operation === "subtract" ? a - b
      : operation === "multiply" ? a * b : a / b;
    return { a, b, answer, symbol: symbols[operation] };
  });
}
export const App = () => {
  const supports = useFeatureSupport();
  const addElement = [addElementAtPoint, addElementAtCursor].find(fn => supports(fn));
  const [operation, setOperation] = useState<Operation>("add");
  const [count, setCount] = useState(10);
  const [max, setMax] = useState(10);
  const [problems, setProblems] = useState<Problem[]>(() => makeProblems("add", 10, 10));
  const [showAnswers, setShowAnswers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const lines = useMemo(() => problems.map((p, i) =>
    `${String(i + 1).padStart(2, " ")}.  ${p.a} ${p.symbol} ${p.b} = ${showAnswers ? p.answer : "_____"}`
  ), [problems, showAnswers]);
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
        children: ["POPPY MATH STUDIO\nName: ____________________  Date: __________\n\n" +
          lines.join("\n") + (showAnswers ? "\n\nANSWER KEY" : "")],
      });
      setMessage("Worksheet added to your Canva design.");
    } catch {
      setMessage("Could not add the worksheet. Try an editable Canva design.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={styles.scrollContainer} style={{ padding: 16 }}>
      <Rows spacing="2u">
        <Text size="large" weight="bold">Poppy Math Studio V26</Text>
        <Text>Generate math practice and add it to your Canva design.</Text>
        <label htmlFor="operation">Math operation</label>
        <select id="operation" value={operation}
          onChange={e => setOperation(e.target.value as Operation)}
          style={{ width: "100%", padding: 9 }}>
          {operations.map(op => <option key={op.key} value={op.key}>{op.label}</option>)}
        </select>
        <label htmlFor="count">Questions</label>
        <select id="count" value={count} onChange={e => setCount(Number(e.target.value))}
          style={{ width: "100%", padding: 9 }}>
          {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <label htmlFor="range">Maximum operand (except division dividend)</label>
        <select id="range" value={max} onChange={e => setMax(Number(e.target.value))}
          style={{ width: "100%", padding: 9 }}>
          {[5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <Button variant="secondary" onClick={generate} stretch>Generate Questions</Button>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={showAnswers}
            onChange={e => setShowAnswers(e.target.checked)} />
          Show answers (answer key preview)
        </label>
        <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace",
          background: "#fff", border: "1px solid #d9d9e0", borderRadius: 8,
          padding: 12, lineHeight: 1.8, maxHeight: 340, overflowY: "auto" }}>
          <strong>Math Practice</strong>{"\n"}
          {"Name: ____________________"}{"\n\n"}
          {lines.join("\n")}
        </div>
        <Button variant="primary" onClick={addToDesign}
          disabled={!addElement || busy} stretch>
          {busy ? "Adding…" : "Add to Design"}
        </Button>
        {!addElement && <Text>This design does not support inserting text elements.</Text>}
        {message && <Text>{message}</Text>}
        <Text size="small">V26 test: inserts editable text. Page layout, imported assets, and batch export are planned for later versions.</Text>
      </Rows>
    </div>
  );
};
