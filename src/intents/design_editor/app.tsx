import { requestFontSelection } from "@canva/asset";
import type { TextElement } from "@canva/design";
import { useFeatureSupport } from "@canva/app-hooks";
import {
  Button,
  Checkbox,
  FormField,
  Rows,
  Text,
  TextInput,
  Title,
} from "@canva/app-ui-kit";
import {
  addElementAtCursor,
  addElementAtPoint,
  addPage,
  getDesignMetadata,
} from "@canva/design";
import { useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import * as styles from "styles/components.css";

import {
  checkProblems,
  generateProblems,
  seededRandom,
  worksheetLines,
} from "./math";
import type { Operation } from "./math";

import { worksheetPage } from "./worksheet_page";

const operations: Operation[] = [
  "add",
  "subtract",
  "multiply",
  "divide",
  "fractionAdd",
  "fractionSubtract",
  "fractionCompare",
  "fractionIdentify",
  "decimalAdd",
  "decimalSubtract",
];
const messages = defineMessages({
  decimalAdd: {
    description: "Decimal operation",
    defaultMessage: "Add decimals (hundredths)",
  },
  decimalSubtract: {
    description: "Decimal operation",
    defaultMessage: "Subtract decimals (hundredths)",
  },
  font: {
    description: "Opens native Canva font picker",
    defaultMessage: "Choose Canva font",
  },
  fontError: {
    description: "Font selection error",
    defaultMessage: "Could not open the Canva font picker.",
  },
  simplify: {
    description: "Student directions for fraction arithmetic",
    defaultMessage: "Solve and write each answer in simplest form.",
  },
  compare: {
    description: "Student directions for comparing fractions",
    defaultMessage: "Write <, >, or = in each blank.",
  },
  fractionAdd: {
    description: "Math operation",
    defaultMessage: "Add like-denominator fractions",
  },
  fractionSubtract: {
    description: "Math operation",
    defaultMessage: "Subtract like-denominator fractions",
  },
  fractionIdentify: {
    description: "Identify a fraction from shaded and unshaded squares",
    defaultMessage: "Identify shaded fractions",
  },
  visualDirections: {
    description: "Directions for fraction models",
    defaultMessage: "Write the fraction that is shaded.",
  },
  difficulty: {
    description: "Difficulty selector",
    defaultMessage: "Difficulty",
  },
  custom: {
    description: "Use the selected manual maximum",
    defaultMessage: "Custom",
  },
  easy: { description: "Difficulty option", defaultMessage: "Easy" },
  medium: { description: "Difficulty option", defaultMessage: "Medium" },
  hard: { description: "Difficulty option", defaultMessage: "Hard" },
  fractionCompare: {
    description: "Math operation",
    defaultMessage: "Compare like-denominator fractions",
  },
  seed: {
    description: "Repeatable worksheet seed label",
    defaultMessage: "Seed (optional)",
  },
  customTitle: {
    description: "Worksheet title field label",
    defaultMessage: "Worksheet title",
  },
  customDirections: {
    description: "Worksheet directions field label",
    defaultMessage: "Student directions",
  },
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
  generationError: {
    description: "Error when worksheet answers fail validation",
    defaultMessage: "Could not verify the answers. Generate a new worksheet.",
  },
  checked: {
    description: "Number of problems generated and checked",
    defaultMessage:
      "{count, plural, one {# question} other {# questions}} generated. Answers checked.",
  },
  insertKey: {
    description: "Button for inserting the answer key into Canva",
    defaultMessage: "Add Answer Key",
  },
  keySuccess: {
    description: "Successful answer key insertion feedback",
    defaultMessage: "Answer key added to your Canva design.",
  },
  columns: {
    description: "Worksheet column count",
    defaultMessage: "Columns per page",
  },
  addPage: {
    description: "Add a formatted worksheet page",
    defaultMessage: "Add Worksheet Page",
  },
  addKeyPage: {
    description: "Add a formatted answer key on a new page",
    defaultMessage: "Add Answer Key Page",
  },
  directions: {
    description: "Student worksheet directions",
    defaultMessage: "Solve each problem.",
  },
  pageAdded: {
    description: "Confirmation after adding a formatted page",
    defaultMessage: "New page added to your Canva design.",
  },
  pageError: {
    description: "Error adding worksheet page",
    defaultMessage: "Could not add a page. Try a paged Canva design.",
  },
  note: {
    description: "Description of the inserted text element",
    defaultMessage: "Adds a single editable text box to your design.",
  },
});
export const App = () => {
  const { formatMessage } = useIntl();
  const supports = useFeatureSupport();
  const addElement = [addElementAtPoint, addElementAtCursor].find((fn) =>
    supports(fn),
  );
  const [font, setFont] = useState<{
    ref: TextElement["fontRef"];
    name: string;
  }>();
  const chooseFont = async () => {
    try {
      const result = await requestFontSelection({ selectedFontRef: font?.ref });
      if (result.type === "completed") setFont(result.font);
    } catch {
      setMessage(formatMessage(messages.fontError));
    }
  };
  const [operation, setOperation] = useState<Operation>("add");
  const [seed, setSeed] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [directions, setDirections] = useState("");
  const [columns, setColumns] = useState(2);
  const canAddPage = supports(addPage) && supports(getDesignMetadata);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<
    "custom" | "easy" | "medium" | "hard"
  >("custom");
  const [max, setMax] = useState(10);
  const [problems, setProblems] = useState(() =>
    generateProblems("add", 10, 10),
  );
  const [showAnswers, setShowAnswers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const lines = useMemo(
    () => worksheetLines(problems, showAnswers),
    [problems, showAnswers],
  );
  const generate = () => {
    const next = generateProblems(
      operation,
      count,
      difficulty === "custom"
        ? max
        : { easy: 5, medium: 10, hard: 100 }[difficulty],
      seed.trim() ? seededRandom(seed.trim()) : Math.random,
    );
    if (!checkProblems(next)) {
      setMessage(formatMessage(messages.generationError));
      return;
    }
    setProblems(next);
    setMessage(formatMessage(messages.checked, { count: next.length }));
  };
  const addToDesign = async (answers: boolean) => {
    if (!addElement || busy) return;
    const exportLines = worksheetLines(problems, answers);
    setBusy(true);
    setMessage("");
    try {
      await addElement({
        type: "text",
        fontRef: font?.ref,
        children: [
          answers
            ? formatMessage(messages.answerTitle) +
              "\n\n" +
              exportLines.join("\n")
            : [
                formatMessage(messages.worksheetTitle),
                formatMessage(messages.nameDate),
                "",
                ...exportLines,
              ].join("\n"),
        ],
      });
      setMessage(
        formatMessage(answers ? messages.keySuccess : messages.success),
      );
    } catch {
      setMessage(formatMessage(messages.error));
    } finally {
      setBusy(false);
    }
  };
  const addFormattedPage = async (answers: boolean) => {
    if (!canAddPage || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const { defaultPageDimensions } = await getDesignMetadata();
      if (!defaultPageDimensions) {
        setMessage(formatMessage(messages.pageError));
        return;
      }
      const title = answers
        ? formatMessage(messages.answerTitle)
        : customTitle.trim() || formatMessage(messages.practice);
      const instructions = answers
        ? []
        : [
            formatMessage(messages.nameDate),
            directions.trim() ||
              formatMessage(
                problems[0]?.operation === "fractionIdentify"
                  ? messages.visualDirections
                  : problems[0]?.operation === "fractionCompare"
                    ? messages.compare
                    : problems[0]?.denominator
                      ? messages.simplify
                      : messages.directions,
              ),
          ];
      await addPage({
        title,
        elements: worksheetPage(
          defaultPageDimensions,
          title,
          instructions,
          worksheetLines(problems, answers),
          columns,
          font?.ref,
        ),
      });
      setMessage(formatMessage(messages.pageAdded));
    } catch {
      setMessage(formatMessage(messages.pageError));
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
          {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <label htmlFor="difficulty">{formatMessage(messages.difficulty)}</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(event) =>
            setDifficulty(event.target.value as typeof difficulty)
          }
        >
          {(["custom", "easy", "medium", "hard"] as const).map((option) => (
            <option key={option} value={option}>
              {formatMessage(messages[option])}
            </option>
          ))}
        </select>
        {difficulty === "custom" && (
          <>
            <label htmlFor="range">{formatMessage(messages.range)}</label>
            <select
              id="range"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              style={{ width: "100%", padding: 9 }}
            >
              {Array.from({ length: 99 }, (_, i) => i + 2).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </>
        )}

        <FormField
          label={formatMessage(messages.seed)}
          value={seed}
          control={(props) => <TextInput {...props} onChange={setSeed} />}
        />
        <FormField
          label={formatMessage(messages.customTitle)}
          value={customTitle}
          control={(props) => (
            <TextInput {...props} onChange={setCustomTitle} maxLength={45} />
          )}
        />
        <FormField
          label={formatMessage(messages.customDirections)}
          value={directions}
          control={(props) => (
            <TextInput {...props} onChange={setDirections} maxLength={70} />
          )}
        />
        <Button variant="secondary" onClick={chooseFont} stretch>
          {font?.name || formatMessage(messages.font)}
        </Button>
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
            fontFamily: "sans-serif",
            color: "#000000",
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
          ].join("\n")}
          {problems[0]?.operation !== "fractionIdentify"
            ? lines.join("\n")
            : lines.map((line, i) => (
                <div key={problems[i]?.id}>
                  {Array.from(line, (character, index) =>
                    character === "■" || character === "□" ? (
                      <span
                        key={index}
                        style={{
                          display: "inline-block",
                          width: "0.85em",
                          height: "0.85em",
                          verticalAlign: "middle",
                          border: "1px solid #000",
                          boxSizing: "border-box",
                          background: character === "■" ? "#000" : "#fff",
                        }}
                      />
                    ) : (
                      character
                    ),
                  )}
                </div>
              ))}
        </div>
        <Button
          variant="primary"
          onClick={() =>
            problems[0]?.operation === "fractionIdentify"
              ? addFormattedPage(false)
              : addToDesign(false)
          }
          disabled={
            busy ||
            (problems[0]?.operation === "fractionIdentify"
              ? !canAddPage
              : !addElement)
          }
          stretch
        >
          {formatMessage(busy ? messages.adding : messages.insert)}
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            problems[0]?.operation === "fractionIdentify"
              ? addFormattedPage(true)
              : addToDesign(true)
          }
          disabled={
            busy ||
            (problems[0]?.operation === "fractionIdentify"
              ? !canAddPage
              : !addElement)
          }
          stretch
        >
          {formatMessage(messages.insertKey)}
        </Button>
        {canAddPage && (
          <>
            <label htmlFor="worksheet-columns">
              {formatMessage(messages.columns)}
            </label>
            <select
              id="worksheet-columns"
              value={columns}
              onChange={(event) => setColumns(Number(event.target.value))}
            >
              {[1, 2].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              onClick={() => addFormattedPage(false)}
              disabled={busy}
              stretch
            >
              {formatMessage(messages.addPage)}
            </Button>
            <Button
              variant="secondary"
              onClick={() => addFormattedPage(true)}
              disabled={busy}
              stretch
            >
              {formatMessage(messages.addKeyPage)}
            </Button>
          </>
        )}
        {!addElement && <Text>{formatMessage(messages.unsupported)}</Text>}
        <div role="status">{message && <Text>{message}</Text>}</div>
        <Text size="small">{formatMessage(messages.note)}</Text>
      </Rows>
    </div>
  );
};
