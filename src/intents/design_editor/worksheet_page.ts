import type { Dimensions, TextElementAtPoint } from "@canva/design";

export function worksheetPage(
  { width, height }: Dimensions,
  title: string,
  instructions: string[],
  lines: string[],
  columns: number,
): TextElementAtPoint[] {
  const margin = width * 0.08;
  const contentWidth = width - 2 * margin;
  const gap = width * 0.04;
  const columnWidth = (contentWidth - (columns - 1) * gap) / columns;
  const rows = Math.ceil(lines.length / columns);
  const rowHeight = (height * 0.72) / rows;
  const bodySize = Math.min(width * 0.026, rowHeight * 0.59, columnWidth / 17);
  const headerSize = Math.min(width * 0.048, height * 0.046);

  const text = (
    value: string,
    left: number,
    top: number,
    boxWidth: number,
    fontSize: number,
  ): TextElementAtPoint => ({
    type: "text",
    children: [value],
    left,
    top,
    width: boxWidth,
    fontSize,
    color: "#000000",
  });

  return [
    text(title, margin, height * 0.055, contentWidth, headerSize),
    ...instructions.map((value, index) =>
      text(
        value,
        margin,
        height * (0.12 + 0.045 * index),
        contentWidth,
        headerSize * 0.53,
      ),
    ),
    ...lines.map((line, index) =>
      text(
        line,
        margin + Math.floor(index / rows) * (columnWidth + gap),
        height * 0.22 + (index % rows) * rowHeight,
        columnWidth,
        bodySize,
      ),
    ),
  ];
}
