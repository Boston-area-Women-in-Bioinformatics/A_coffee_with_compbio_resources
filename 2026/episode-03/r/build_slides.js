const pptxgen = require("pptxgenjs");
const path    = require("path");

// ── Config ────────────────────────────────────────────────────────────────────
const OUT_DIR  = path.join(__dirname, "qc_output");
const FIG_PATH = path.resolve(OUT_DIR, "qc_summary_figure.png");
const OUT_FILE = path.join(OUT_DIR, "PBMC3K_QC_Presentation.pptx");

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  navy      : "0A2342",   // dark background
  teal      : "1C7293",   // primary accent
  teal_lt   : "028090",   // lighter teal
  mint      : "02C39A",   // highlight accent
  white     : "FFFFFF",
  offwhite  : "F4F8FB",
  slate     : "2D3748",   // body text
  muted     : "718096",   // captions
  pass_blue : "2166AC",   // pass colour (matches R plot)
  fail_red  : "D73027",   // fail colour (matches R plot)
  card_bg   : "EBF4F8",   // light card fill
  divider   : "C8DDE8",   // subtle line
};

const FONT_HEAD = "Calibri";
const FONT_BODY = "Calibri";

const W = 13.33;   // LAYOUT_WIDE width  (inches)
const H = 7.5;     // LAYOUT_WIDE height (inches)

// ── Helper: section label strip at top of content slides ─────────────────────
function addTopStrip(slide, label) {
  slide.addShape("rect", {
    x: 0, y: 0, w: W, h: 0.55,
    fill: { color: C.navy }, line: { color: C.navy }
  });
  slide.addText(label.toUpperCase(), {
    x: 0.4, y: 0, w: W - 0.8, h: 0.55,
    fontSize: 10, bold: true, color: C.mint,
    fontFace: FONT_HEAD, charSpacing: 3,
    valign: "middle", margin: 0
  });
}

// Helper: stat card (white rect + big number + label)
function addStatCard(slide, x, y, w, h, value, label, valueColor) {
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: C.divider, width: 1 },
    shadow: { type: "outer", blur: 8, offset: 2, angle: 135, color: "000000", opacity: 0.08 }
  });
  // top accent bar
  slide.addShape("rect", {
    x, y, w: w, h: 0.06,
    fill: { color: valueColor || C.teal }, line: { color: valueColor || C.teal }
  });
  slide.addText(String(value), {
    x: x + 0.15, y: y + 0.2, w: w - 0.3, h: h * 0.52,
    fontSize: 36, bold: true, color: valueColor || C.teal,
    fontFace: FONT_HEAD, align: "center", valign: "middle", margin: 0
  });
  slide.addText(label, {
    x: x + 0.1, y: y + h * 0.62, w: w - 0.2, h: h * 0.32,
    fontSize: 11, color: C.muted,
    fontFace: FONT_BODY, align: "center", valign: "top", margin: 0
  });
}

// ── Build presentation ────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title  = "PBMC 3K scRNA-seq QC";

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Left teal accent bar
  s.addShape("rect", {
    x: 0, y: 0, w: 0.35, h: H,
    fill: { color: C.teal }, line: { color: C.teal }
  });
  // Mint thin inner bar
  s.addShape("rect", {
    x: 0.35, y: 0, w: 0.06, h: H,
    fill: { color: C.mint }, line: { color: C.mint }
  });

  // Tag line
  s.addText("SINGLE-CELL RNA-SEQ", {
    x: 1.0, y: 1.5, w: 9, h: 0.5,
    fontSize: 12, bold: true, color: C.mint, charSpacing: 4,
    fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  // Main title
  s.addText("PBMC 3K\nQuality Control Analysis", {
    x: 1.0, y: 2.1, w: 10, h: 2.2,
    fontSize: 46, bold: true, color: C.white,
    fontFace: FONT_HEAD, valign: "top", margin: 0
  });

  // Divider
  s.addShape("rect", {
    x: 1.0, y: 4.45, w: 5.5, h: 0.04,
    fill: { color: C.teal_lt }, line: { color: C.teal_lt }
  });

  // Subtitle / metadata
  s.addText([
    { text: "Dataset:  ", options: { bold: true, color: C.mint } },
    { text: "10X Genomics Chromium v2  |  Human PBMCs  |  hg19\n", options: { color: "AECBD8" } },
    { text: "Tools:    ", options: { bold: true, color: C.mint } },
    { text: "Seurat v5.4.0  |  R v4.5.2", options: { color: "AECBD8" } },
  ], {
    x: 1.0, y: 4.6, w: 10, h: 1.0,
    fontSize: 13, fontFace: FONT_BODY, valign: "top", margin: 0
  });

  // Slide number placeholder (bottom right)
  s.addText("1", {
    x: W - 0.7, y: H - 0.4, w: 0.5, h: 0.3,
    fontSize: 9, color: "4A7FA0", fontFace: FONT_BODY, align: "right", margin: 0
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Dataset at a Glance
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  addTopStrip(s, "Dataset Overview");

  s.addText("Dataset at a Glance", {
    x: 0.5, y: 0.65, w: W - 1, h: 0.7,
    fontSize: 28, bold: true, color: C.navy,
    fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  // 4 stat cards
  const cw = 2.7, ch = 1.9, cy = 1.6, gap = 0.28;
  const cx0 = (W - (4 * cw + 3 * gap)) / 2;
  addStatCard(s, cx0,              cy, cw, ch, "2,700",  "Input cells",    C.teal);
  addStatCard(s, cx0 + cw + gap,   cy, cw, ch, "32,738", "Genes profiled", C.teal);
  addStatCard(s, cx0 + 2*(cw+gap), cy, cw, ch, "13,714", "Genes retained\n(min.cells = 3)", C.teal_lt);
  addStatCard(s, cx0 + 3*(cw+gap), cy, cw, ch, "2.29M",  "Total UMIs",     C.teal_lt);

  // Description text
  s.addText(
    "Peripheral blood mononuclear cells (PBMCs) from a healthy donor, sequenced on the 10X Chromium v2 platform. " +
    "This publicly available reference dataset is used here to demonstrate the Seurat QC workflow.",
    {
      x: 0.9, y: 3.75, w: W - 1.8, h: 1.1,
      fontSize: 13, color: C.slate, fontFace: FONT_BODY,
      align: "center", valign: "top", margin: 0
    }
  );

  // Ref genome pill
  s.addShape("rect", {
    x: 5.4, y: 5.1, w: 2.5, h: 0.46,
    fill: { color: C.card_bg }, line: { color: C.divider, width: 1 },
    rectRadius: 0.05
  });
  s.addText("Reference genome: hg19", {
    x: 5.4, y: 5.1, w: 2.5, h: 0.46,
    fontSize: 11, color: C.teal, fontFace: FONT_BODY, align: "center", valign: "middle", margin: 0
  });

  s.addText("2", {
    x: W - 0.7, y: H - 0.4, w: 0.5, h: 0.3,
    fontSize: 9, color: C.muted, fontFace: FONT_BODY, align: "right", margin: 0
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — QC Metrics Summary (table + correlation callout)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  addTopStrip(s, "Quality Metrics");

  s.addText("QC Metric Distributions", {
    x: 0.5, y: 0.65, w: 8, h: 0.7,
    fontSize: 28, bold: true, color: C.navy,
    fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  // Table
  const headerFill  = { color: C.navy };
  const rowFill1    = { color: C.white };
  const rowFill2    = { color: C.card_bg };
  const headerStyle = { bold: true, color: C.white, fontSize: 12, fontFace: FONT_HEAD };
  const cell = (text, fill, bold, align) => ({
    text,
    options: { fill, bold: bold || false, color: bold ? C.white : C.slate,
               fontSize: 12, fontFace: FONT_BODY, align: align || "center", valign: "middle" }
  });

  const tableData = [
    [
      { text: "Metric",        options: { ...headerStyle, fill: headerFill, align: "left"   } },
      { text: "Min",           options: { ...headerStyle, fill: headerFill } },
      { text: "Median",        options: { ...headerStyle, fill: headerFill } },
      { text: "Mean",          options: { ...headerStyle, fill: headerFill } },
      { text: "Max",           options: { ...headerStyle, fill: headerFill } },
      { text: "SD",            options: { ...headerStyle, fill: headerFill } },
    ],
    [
      { text: "nFeature_RNA  (genes / cell)", options: { fill: rowFill1, color: C.slate, fontSize: 12, fontFace: FONT_BODY, align: "left", valign: "middle" } },
      cell("212",     rowFill1), cell("816",   rowFill1), cell("845",   rowFill1),
      cell("3,400",   rowFill1), cell("281",   rowFill1),
    ],
    [
      { text: "nCount_RNA  (UMIs / cell)", options: { fill: rowFill2, color: C.slate, fontSize: 12, fontFace: FONT_BODY, align: "left", valign: "middle" } },
      cell("546",     rowFill2), cell("2,196", rowFill2), cell("2,365", rowFill2),
      cell("15,818",  rowFill2), cell("1,093", rowFill2),
    ],
    [
      { text: "percent.mt  (% mito reads)", options: { fill: rowFill1, color: C.slate, fontSize: 12, fontFace: FONT_BODY, align: "left", valign: "middle" } },
      cell("0.0%",    rowFill1), cell("2.0%",  rowFill1), cell("2.2%",  rowFill1),
      cell("22.6%",   rowFill1), cell("1.2%",  rowFill1),
    ],
  ];

  s.addTable(tableData, {
    x: 0.5, y: 1.5, w: 8.5, h: 2.6,
    border: { type: "solid", pt: 0.5, color: C.divider },
    rowH: [0.52, 0.65, 0.65, 0.65],
  });

  // Correlation callout card
  s.addShape("rect", {
    x: 9.35, y: 1.5, w: 3.3, h: 2.6,
    fill: { color: C.navy }, line: { color: C.navy },
    shadow: { type: "outer", blur: 10, offset: 3, angle: 135, color: "000000", opacity: 0.12 }
  });
  s.addShape("rect", { x: 9.35, y: 1.5, w: 3.3, h: 0.06, fill: { color: C.mint }, line: { color: C.mint } });

  s.addText("nCount ~ nFeature\nCorrelation", {
    x: 9.5, y: 1.65, w: 3.0, h: 0.8,
    fontSize: 11, color: C.mint, bold: true,
    fontFace: FONT_HEAD, align: "center", valign: "middle", margin: 0
  });
  s.addText("r = 0.95", {
    x: 9.5, y: 2.5, w: 3.0, h: 0.9,
    fontSize: 38, bold: true, color: C.white,
    fontFace: FONT_HEAD, align: "center", valign: "middle", margin: 0
  });
  s.addText("Excellent signal quality", {
    x: 9.5, y: 3.4, w: 3.0, h: 0.55,
    fontSize: 11, color: "AECBD8",
    fontFace: FONT_BODY, align: "center", valign: "middle", margin: 0
  });

  // Thresholds applied
  s.addText("Thresholds Applied", {
    x: 0.5, y: 4.3, w: 5, h: 0.4,
    fontSize: 14, bold: true, color: C.navy, fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  const thresholds = [
    { label: "nFeature_RNA  ≥ 200",    note: "Remove empty droplets / debris",  col: C.teal     },
    { label: "nFeature_RNA  ≤ 2,500",  note: "Flag potential doublets",          col: C.teal     },
    { label: "percent.mt  ≤ 5%",       note: "Remove damaged / dying cells",     col: C.fail_red },
  ];
  thresholds.forEach((t, i) => {
    const tx = 0.5 + i * 4.1;
    s.addShape("rect", {
      x: tx, y: 4.85, w: 3.85, h: 1.2,
      fill: { color: C.white }, line: { color: C.divider, width: 1 },
      shadow: { type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.07 }
    });
    s.addShape("rect", { x: tx, y: 4.85, w: 3.85, h: 0.06, fill: { color: t.col }, line: { color: t.col } });
    s.addText(t.label, {
      x: tx + 0.15, y: 5.0, w: 3.55, h: 0.42,
      fontSize: 13, bold: true, color: C.navy, fontFace: FONT_HEAD, valign: "middle", margin: 0
    });
    s.addText(t.note, {
      x: tx + 0.15, y: 5.45, w: 3.55, h: 0.5,
      fontSize: 11, color: C.muted, fontFace: FONT_BODY, valign: "top", margin: 0
    });
  });

  s.addText("3", {
    x: W - 0.7, y: H - 0.4, w: 0.5, h: 0.3,
    fontSize: 9, color: C.muted, fontFace: FONT_BODY, align: "right", margin: 0
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — QC Summary Figure
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  addTopStrip(s, "QC Visualisation");

  s.addText("Quality Control Overview", {
    x: 0.5, y: 0.65, w: W - 1, h: 0.65,
    fontSize: 28, bold: true, color: C.navy,
    fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  // QC figure — preserve 13×8 aspect ratio inside available space
  const figW = 11.8;
  const figH = figW * (8 / 13);
  const figX = (W - figW) / 2;

  s.addImage({
    path    : FIG_PATH,
    x: figX, y: 1.4, w: figW, h: figH,
    altText : "QC Summary Figure",
  });

  s.addText("Blue = cells passing all QC thresholds  |  Red = cells flagged for removal  |  Dashed lines = threshold boundaries", {
    x: 0.5, y: H - 0.55, w: W - 1, h: 0.4,
    fontSize: 9.5, color: C.muted, fontFace: FONT_BODY, align: "center", margin: 0
  });

  s.addText("4", {
    x: W - 0.7, y: H - 0.4, w: 0.5, h: 0.3,
    fontSize: 9, color: C.muted, fontFace: FONT_BODY, align: "right", margin: 0
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Filter Results
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  addTopStrip(s, "Filtering Results");

  s.addText("Cells Retained After Filtering", {
    x: 0.5, y: 0.65, w: W - 1, h: 0.7,
    fontSize: 28, bold: true, color: C.navy, fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  // Big central stat
  s.addShape("rect", {
    x: 4.4, y: 1.55, w: 4.55, h: 2.55,
    fill: { color: C.navy }, line: { color: C.navy },
    shadow: { type: "outer", blur: 14, offset: 4, angle: 135, color: "000000", opacity: 0.15 }
  });
  s.addShape("rect", { x: 4.4, y: 1.55, w: 4.55, h: 0.07, fill: { color: C.mint }, line: { color: C.mint } });

  s.addText("2,638 / 2,700", {
    x: 4.5, y: 1.75, w: 4.35, h: 1.1,
    fontSize: 40, bold: true, color: C.white, fontFace: FONT_HEAD, align: "center", valign: "middle", margin: 0
  });
  s.addText("cells retained", {
    x: 4.5, y: 2.85, w: 4.35, h: 0.45,
    fontSize: 14, color: "AECBD8", fontFace: FONT_BODY, align: "center", valign: "middle", margin: 0
  });
  s.addText("97.7%", {
    x: 4.5, y: 3.3, w: 4.35, h: 0.65,
    fontSize: 30, bold: true, color: C.mint, fontFace: FONT_HEAD, align: "center", valign: "middle", margin: 0
  });

  // Three removal cards
  const cards = [
    { n: "57",  pct: "2.1%", label: "cells removed\n(High MT% > 5%)",       col: C.fail_red, x: 0.45 },
    { n: "5",   pct: "0.2%", label: "cells removed\n(High genes > 2,500)",   col: C.teal,     x: 9.45 },
    { n: "0",   pct: "0.0%", label: "cells removed\n(Low genes < 200)",       col: C.muted,    x: 9.45 + 0.001 },
  ];

  // Left card (high MT)
  s.addShape("rect", {
    x: 0.45, y: 1.55, w: 3.65, h: 2.55,
    fill: { color: C.white }, line: { color: C.divider, width: 1 },
    shadow: { type: "outer", blur: 8, offset: 2, angle: 135, color: "000000", opacity: 0.08 }
  });
  s.addShape("rect", { x: 0.45, y: 1.55, w: 3.65, h: 0.07, fill: { color: C.fail_red }, line: { color: C.fail_red } });
  s.addText("57", { x: 0.55, y: 1.75, w: 3.45, h: 0.95, fontSize: 48, bold: true, color: C.fail_red, fontFace: FONT_HEAD, align: "center", valign: "middle", margin: 0 });
  s.addText("2.1%  of cells", { x: 0.55, y: 2.75, w: 3.45, h: 0.4, fontSize: 14, bold: true, color: C.slate, fontFace: FONT_BODY, align: "center", valign: "middle", margin: 0 });
  s.addText("removed: High MT%\n(> 5% mitochondrial reads)", { x: 0.55, y: 3.2, w: 3.45, h: 0.7, fontSize: 11, color: C.muted, fontFace: FONT_BODY, align: "center", valign: "top", margin: 0 });

  // Right card (high genes)
  s.addShape("rect", {
    x: 9.25, y: 1.55, w: 3.65, h: 2.55,
    fill: { color: C.white }, line: { color: C.divider, width: 1 },
    shadow: { type: "outer", blur: 8, offset: 2, angle: 135, color: "000000", opacity: 0.08 }
  });
  s.addShape("rect", { x: 9.25, y: 1.55, w: 3.65, h: 0.07, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("5", { x: 9.35, y: 1.75, w: 3.45, h: 0.95, fontSize: 48, bold: true, color: C.teal, fontFace: FONT_HEAD, align: "center", valign: "middle", margin: 0 });
  s.addText("0.2%  of cells", { x: 9.35, y: 2.75, w: 3.45, h: 0.4, fontSize: 14, bold: true, color: C.slate, fontFace: FONT_BODY, align: "center", valign: "middle", margin: 0 });
  s.addText("removed: Likely doublets\n(> 2,500 genes / cell)", { x: 9.35, y: 3.2, w: 3.45, h: 0.7, fontSize: 11, color: C.muted, fontFace: FONT_BODY, align: "center", valign: "top", margin: 0 });

  // Bottom: no low-gene cells
  s.addShape("rect", {
    x: 3.5, y: 4.35, w: 6.35, h: 0.9,
    fill: { color: C.card_bg }, line: { color: C.divider, width: 1 }
  });
  s.addText("✓  No low-complexity cells detected  (0 cells below 200-gene threshold)", {
    x: 3.6, y: 4.35, w: 6.15, h: 0.9,
    fontSize: 12, color: C.teal, bold: true,
    fontFace: FONT_BODY, align: "center", valign: "middle", margin: 0
  });

  s.addText("5", {
    x: W - 0.7, y: H - 0.4, w: 0.5, h: 0.3,
    fontSize: 9, color: C.muted, fontFace: FONT_BODY, align: "right", margin: 0
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Key Findings
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offwhite };
  addTopStrip(s, "Interpretation");

  s.addText("Key Findings", {
    x: 0.5, y: 0.65, w: W - 1, h: 0.7,
    fontSize: 28, bold: true, color: C.navy, fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  const findings = [
    {
      icon: "✓",  col: C.teal,
      title: "Low Mitochondrial Content",
      body:  "Median MT% of 2.0% and mean of 2.2% indicate excellent cell viability. Only 57 cells (2.1%) exceed the 5% threshold — consistent with a healthy PBMC preparation.",
    },
    {
      icon: "✓",  col: C.teal,
      title: "Strong UMI–Gene Correlation  (r = 0.95)",
      body:  "A near-linear relationship between UMI counts and gene counts confirms high technical quality. Off-diagonal outliers that would indicate ambient RNA contamination are absent.",
    },
    {
      icon: "✓",  col: C.teal,
      title: "Minimal Doublet Contamination",
      body:  "Only 5 cells exceed the 2,500-gene doublet threshold (0.2%). The nCount–nFeature scatter shows no distinct off-diagonal cluster characteristic of doublets.",
    },
    {
      icon: "⚠",  col: "E07B00",
      title: "Outlier Worth Monitoring",
      body:  "Two extreme outliers (one cell at ~22% MT%, one at ~15,800 UMIs) were removed by the filters. If downstream clustering yields a mixed-marker cluster, consider running DoubletFinder.",
    },
  ];

  findings.forEach((f, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const fx = 0.5 + col * 6.4;
    const fy = 1.55 + row * 2.35;

    s.addShape("rect", {
      x: fx, y: fy, w: 6.1, h: 2.1,
      fill: { color: C.white }, line: { color: C.divider, width: 1 },
      shadow: { type: "outer", blur: 8, offset: 2, angle: 135, color: "000000", opacity: 0.07 }
    });
    s.addShape("rect", { x: fx, y: fy, w: 6.1, h: 0.06, fill: { color: f.col }, line: { color: f.col } });

    // Icon circle
    s.addShape("oval", {
      x: fx + 0.2, y: fy + 0.22, w: 0.46, h: 0.46,
      fill: { color: f.col }, line: { color: f.col }
    });
    s.addText(f.icon, {
      x: fx + 0.2, y: fy + 0.22, w: 0.46, h: 0.46,
      fontSize: 14, bold: true, color: C.white, fontFace: FONT_HEAD,
      align: "center", valign: "middle", margin: 0
    });

    s.addText(f.title, {
      x: fx + 0.8, y: fy + 0.22, w: 5.1, h: 0.46,
      fontSize: 13, bold: true, color: C.navy,
      fontFace: FONT_HEAD, valign: "middle", margin: 0
    });
    s.addText(f.body, {
      x: fx + 0.2, y: fy + 0.78, w: 5.75, h: 1.2,
      fontSize: 11.5, color: C.slate,
      fontFace: FONT_BODY, valign: "top", margin: 0
    });
  });

  s.addText("6", {
    x: W - 0.7, y: H - 0.4, w: 0.5, h: 0.3,
    fontSize: 9, color: C.muted, fontFace: FONT_BODY, align: "right", margin: 0
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Next Steps (dark closing slide)
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Left accent bars (mirror of title)
  s.addShape("rect", {
    x: 0, y: 0, w: 0.35, h: H,
    fill: { color: C.teal }, line: { color: C.teal }
  });
  s.addShape("rect", {
    x: 0.35, y: 0, w: 0.06, h: H,
    fill: { color: C.mint }, line: { color: C.mint }
  });

  s.addText("READY FOR DOWNSTREAM ANALYSIS", {
    x: 1.0, y: 0.9, w: 11, h: 0.5,
    fontSize: 12, bold: true, color: C.mint, charSpacing: 3,
    fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  s.addText("Next Steps", {
    x: 1.0, y: 1.4, w: 8, h: 0.8,
    fontSize: 34, bold: true, color: C.white,
    fontFace: FONT_HEAD, valign: "middle", margin: 0
  });

  const steps = [
    { num: "01", title: "Normalize",   body: "NormalizeData() — log-normalize counts to 10,000 reads per cell\nor use SCTransform() for regularized negative-binomial regression." },
    { num: "02", title: "Cluster",     body: "FindVariableFeatures() → ScaleData() → RunPCA() → FindNeighbors()\n→ FindClusters() — identify cell populations at desired resolution." },
    { num: "03", title: "Annotate",    body: "RunUMAP() for visualization. Annotate clusters using canonical\nPBMC marker genes (CD3, CD14, CD19, FCGR3A, etc.)." },
  ];

  steps.forEach((step, i) => {
    const sy = 2.3 + i * 1.55;
    // Number bubble
    s.addShape("oval", {
      x: 1.0, y: sy, w: 0.7, h: 0.7,
      fill: { color: C.teal }, line: { color: C.teal }
    });
    s.addText(step.num, {
      x: 1.0, y: sy, w: 0.7, h: 0.7,
      fontSize: 14, bold: true, color: C.white,
      fontFace: FONT_HEAD, align: "center", valign: "middle", margin: 0
    });

    // Connector line (not for last)
    if (i < steps.length - 1) {
      s.addShape("rect", {
        x: 1.3, y: sy + 0.72, w: 0.06, h: 0.76,
        fill: { color: "2E5F7A" }, line: { color: "2E5F7A" }
      });
    }

    s.addText(step.title, {
      x: 1.9, y: sy, w: 3, h: 0.7,
      fontSize: 16, bold: true, color: C.mint,
      fontFace: FONT_HEAD, valign: "middle", margin: 0
    });
    s.addText(step.body, {
      x: 4.95, y: sy - 0.05, w: 7.5, h: 1.1,
      fontSize: 11.5, color: "AECBD8",
      fontFace: FONT_BODY, valign: "middle", margin: 0
    });
  });

  // Output file note
  s.addShape("rect", {
    x: 1.0, y: 6.6, w: 11.0, h: 0.55,
    fill: { color: "112B42" }, line: { color: "1C4A6E", width: 1 }
  });
  s.addText("Filtered Seurat object saved:  qc_output/pbmc3k_filtered.rds  (13,714 genes × 2,638 cells)", {
    x: 1.1, y: 6.6, w: 10.8, h: 0.55,
    fontSize: 11, color: C.mint, fontFace: "Consolas",
    align: "center", valign: "middle", margin: 0
  });

  s.addText("7", {
    x: W - 0.7, y: H - 0.4, w: 0.5, h: 0.3,
    fontSize: 9, color: "4A7FA0", fontFace: FONT_BODY, align: "right", margin: 0
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: OUT_FILE })
  .then(() => console.log("DONE:", OUT_FILE))
  .catch(e => { console.error("ERROR:", e); process.exit(1); });
