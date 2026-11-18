import type {
  Dimensions,
  ElementAtPoint,
  TextElementAtPoint,
} from "@canva/design";

export function worksheetPage(
  { width, height }: Dimensions,
  title: string,
  instructions: string[],
  lines: string[],
  columns: number,
  fontRef?: TextElementAtPoint["fontRef"],
): ElementAtPoint[] {
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
    fontRef,
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
    ...lines.flatMap((line, index): ElementAtPoint[] => {
      const left = margin + Math.floor(index / rows) * (columnWidth + gap);
      const top = height * 0.22 + (index % rows) * rowHeight;
      const model = /^(\d+\.\s+)([■□]+)(.*)$/.exec(line);
      if (!model) return [text(line, left, top, columnWidth, bodySize)];
      const [, number = "", cells = "", suffix = ""] = model;
      const size = Math.min(bodySize, columnWidth / (cells.length + 13));
      const barLeft = left + size * 3;
      const barWidth = size * cells.length;
      const answerLeft = barLeft + barWidth + size * 0.65;
      const rectangle = (x: number, y: number, w: number, h: number) =>
        `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
      const paths = [
        {
          d: rectangle(0, 0, cells.length * 12, 12),
          fill: { color: "#000000" },
        },
      ];
      const unshaded = Array.from(cells, (cell, i) =>
        cell === "□" ? rectangle(i * 12 + 1, 1, 10, 10) : "",
      ).join(" ");
      if (unshaded.trim())
        paths.push({ d: unshaded, fill: { color: "#ffffff" } });
      const divisions = Array.from(cells.slice(1), (_, i) =>
        rectangle((i + 1) * 12 - 0.5, 0, 1, 12),
      ).join(" ");
      if (divisions) paths.push({ d: divisions, fill: { color: "#000000" } });
      const shadedDivisions = Array.from(cells.slice(1), (cell, i) =>
        cell === "■" && cells[i] === "■"
          ? rectangle((i + 1) * 12 - 0.5, 1, 1, 10)
          : "",
      ).join(" ");
      if (shadedDivisions.trim())
        paths.push({ d: shadedDivisions, fill: { color: "#ffffff" } });
      return [
        text(number.trim(), left, top, size * 2.9, size),
        {
          type: "shape",
          paths,
          viewBox: { top: 0, left: 0, width: cells.length * 12, height: 12 },
          top: top + size * 0.15,
          left: barLeft,
          width: barWidth,
          height: size,
        },
        text(
          suffix.trim(),
          answerLeft,
          top,
          left + columnWidth - answerLeft,
          size,
        ),
      ];
    }),
  ];
}
