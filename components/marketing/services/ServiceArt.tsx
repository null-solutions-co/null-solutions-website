import type { CSSProperties, ReactNode } from "react";

/**
 * One small diagram per service line, drawn in SVG so it stays sharp and
 * weighs nothing. Each explains the service at a glance rather than showing a
 * finished product (the home page's work cards already do that). Accent colour
 * comes in as `--c` from the figure. Motion classes (`a-rise`, `a-flow`…) live
 * in globals.css and only run while the figure is on; `--d` staggers them.
 */

const INK = "#0a0a0a";
const MUTED = "#9a9a9a";
const LINE = "#dedede";
const SOFT = "#f2f2f2";
const C = "var(--c)";

const d = (n: number, extra?: Record<string, string | number>) => ({ "--d": n, ...extra }) as CSSProperties;
const mono = { fontFamily: "var(--font-mono)" };

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 480 360" className="svc-art h-auto w-full" style={{ direction: "ltr" }} aria-hidden="true">
      {children}
    </svg>
  );
}

function Check({ x, y, n, r = 9 }: { x: number; y: number; n: number; r?: number }) {
  return (
    <g className="a-pop" style={d(n)}>
      <circle cx={x} cy={y} r={r} fill={C} />
      <path d={`M${x - r * 0.42} ${y}l${r * 0.3} ${r * 0.3} ${r * 0.55}-${r * 0.6}`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** S1 · a site assembling itself: nav, headline, products, and it's fast. */
function Web() {
  return (
    <Frame>
      <g className="a-rise" style={d(0)}>
        <rect x="40" y="40" width="400" height="290" rx="14" fill="#fff" stroke={LINE} />
        <path d="M40 54a14 14 0 0 1 14-14h372a14 14 0 0 1 14 14v18H40z" fill={SOFT} />
        <circle cx="60" cy="56" r="4" fill="#ff6159" />
        <circle cx="74" cy="56" r="4" fill="#ffbd2e" />
        <circle cx="88" cy="56" r="4" fill="#28c941" />
        <rect x="150" y="50" width="180" height="12" rx="6" fill="#ececec" />
      </g>
      <g className="a-rise" style={d(1)}>
        <rect x="64" y="90" width="44" height="8" rx="4" fill={INK} />
        <rect x="292" y="91" width="28" height="6" rx="3" fill={MUTED} />
        <rect x="328" y="91" width="28" height="6" rx="3" fill={MUTED} />
        <rect x="370" y="87" width="46" height="14" rx="7" fill={C} />
      </g>
      <g className="a-rise" style={d(2)}>
        <rect x="64" y="120" width="172" height="16" rx="4" fill={INK} />
        <rect x="64" y="142" width="132" height="16" rx="4" fill={INK} />
        <rect x="64" y="168" width="150" height="7" rx="3.5" fill={MUTED} />
        <rect x="64" y="182" width="118" height="7" rx="3.5" fill={MUTED} />
        <rect x="64" y="200" width="72" height="22" rx="11" fill={C} />
      </g>
      <g className="a-pop" style={d(3)}>
        <rect x="262" y="116" width="154" height="106" rx="10" fill={C} fillOpacity="0.13" />
        <circle cx="339" cy="169" r="30" fill={C} fillOpacity="0.32" />
        <path d="M262 206l40-34 30 24 26-18 58 40v4a10 10 0 0 1-10 10H272a10 10 0 0 1-10-10z" fill={C} fillOpacity="0.28" />
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} className="a-rise" style={d(4 + i)}>
          <rect x={64 + i * 120} y="240" width="108" height="72" rx="8" fill={SOFT} />
          <rect x={72 + i * 120} y="248" width="92" height="36" rx="5" fill="#ececec" />
          <rect x={72 + i * 120} y="293" width="48" height="6" rx="3" fill={INK} />
          <rect x={138 + i * 120} y="293" width="26" height="6" rx="3" fill={C} />
        </g>
      ))}
      <g className="a-pop" style={d(8)}>
        <rect x="330" y="14" width="122" height="36" rx="18" fill={INK} />
        <circle cx="352" cy="32" r="9" fill="none" stroke="#5c5c5c" strokeWidth="3" />
        <text x="368" y="37" fill="#fff" fontSize="13" style={mono}>
          fast · SEO
        </text>
      </g>
    </Frame>
  );
}

/** S2 · an internal tool: people, roles, switches, and every change logged. */
function App() {
  const rows = [
    { c: "#0d1b2a", role: "Admin", on: true },
    { c: "#5c5c5c", role: "Editor", on: true },
    { c: "#9a9a9a", role: "Viewer", on: false },
    { c: "#3d3d3d", role: "Editor", on: true },
  ];
  return (
    <Frame>
      <g className="a-rise" style={d(0)}>
        <rect x="40" y="34" width="400" height="286" rx="14" fill="#fff" stroke={LINE} />
        <text x="64" y="72" fill={INK} fontSize="16" fontWeight="600">
          Team access
        </text>
        <rect x="350" y="56" width="66" height="24" rx="12" fill={C} />
        <text x="365" y="72" fill="#fff" fontSize="11" style={mono}>
          + Invite
        </text>
        <line x1="40" y1="96" x2="440" y2="96" stroke={LINE} />
      </g>
      {rows.map((r, i) => (
        <g key={i} className="a-rise" style={d(1 + i)}>
          <circle cx="78" cy={126 + i * 46} r="13" fill={r.c} />
          <rect x="102" y={117 + i * 46} width={90 - i * 8} height="8" rx="4" fill={INK} />
          <rect x="102" y={130 + i * 46} width="120" height="6" rx="3" fill={MUTED} />
          <rect x="262" y={114 + i * 46} width="62" height="24" rx="12" fill={r.role === "Admin" ? C : SOFT} />
          <text x={r.role === "Viewer" ? 274 : 276} y={130 + i * 46} fontSize="11" fill={r.role === "Admin" ? "#fff" : INK} style={mono}>
            {r.role}
          </text>
          <rect x="370" y={116 + i * 46} width="40" height="20" rx="10" fill={r.on ? C : "#dedede"} />
          <circle cx={r.on ? 400 : 380} cy={126 + i * 46} r="8" fill="#fff" />
        </g>
      ))}
      <g className="a-drop" style={d(7)}>
        <rect x="196" y="298" width="236" height="40" rx="20" fill={INK} />
        <circle cx="220" cy="318" r="6" fill="#5c5c5c" />
        <text x="236" y="323" fill="#fff" fontSize="12" style={mono}>
          role changed · logged
        </text>
      </g>
    </Frame>
  );
}

/** S3 · the same app on iPhone and Android, with a notification landing. */
function Mobile() {
  const phone = (x: number, rot: number, n: number, dark: boolean) => (
    <g className="a-rise" style={d(n)} transform={`rotate(${rot} ${x + 70} 190)`}>
      <rect x={x} y="40" width="140" height="290" rx="26" fill={INK} />
      <rect x={x + 7} y="47" width="126" height="276" rx="20" fill={dark ? "#161616" : "#fff"} />
      <rect x={x + 50} y="53" width="40" height="9" rx="4.5" fill={INK} />
      <rect x={x + 18} y="80" width="70" height="10" rx="5" fill={dark ? "#fff" : INK} />
      <rect x={x + 18} y="100" width="104" height="70" rx="12" fill={C} fillOpacity={dark ? 0.55 : 0.18} />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x={x + 18} y={184 + k * 38} width="28" height="28" rx="8" fill={dark ? "#2a3a4c" : SOFT} />
          <rect x={x + 54} y={188 + k * 38} width="60" height="7" rx="3.5" fill={dark ? "#ececec" : INK} />
          <rect x={x + 54} y={200 + k * 38} width="40" height="6" rx="3" fill={MUTED} />
        </g>
      ))}
    </g>
  );
  return (
    <Frame>
      {phone(96, -7, 0, false)}
      {phone(246, 7, 1, true)}
      <g className="a-drop" style={d(4)}>
        <rect x="70" y="20" width="200" height="50" rx="16" fill="#fff" stroke={LINE} />
        <rect x="82" y="32" width="26" height="26" rx="7" fill={C} />
        <rect x="118" y="34" width="100" height="8" rx="4" fill={INK} />
        <rect x="118" y="48" width="130" height="6" rx="3" fill={MUTED} />
      </g>
      <g className="a-pop" style={d(6)}>
        <rect x="150" y="332" width="64" height="22" rx="11" fill={SOFT} />
        <text x="170" y="347" fontSize="11" fill={INK} style={mono}>
          iOS
        </text>
        <rect x="266" y="332" width="80" height="22" rx="11" fill={SOFT} />
        <text x="279" y="347" fontSize="11" fill={INK} style={mono}>
          Android
        </text>
      </g>
    </Frame>
  );
}

/** S4 · AI reads a document, pulls out the fields, and points to where it found them. */
function Ai() {
  return (
    <Frame>
      <g className="a-rise" style={d(0)}>
        <rect x="40" y="36" width="190" height="288" rx="10" fill="#fff" stroke={LINE} />
        <rect x="60" y="58" width="80" height="10" rx="5" fill={INK} />
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x="60" y={84 + i * 20} width={[150, 132, 146, 120, 150, 140, 96, 150, 128, 144, 110][i]} height="6" rx="3" fill={MUTED} fillOpacity="0.7" />
        ))}
      </g>
      <rect className="a-fill" style={d(2)} x="56" y="120" width="140" height="14" rx="3" fill={C} fillOpacity="0.28" />
      <rect className="a-fill" style={d(3)} x="56" y="220" width="104" height="14" rx="3" fill={C} fillOpacity="0.28" />
      <path className="a-dash" style={d(4)} d="M200 127 C 230 127, 236 110, 262 110" fill="none" stroke={C} strokeWidth="2" strokeDasharray="5 7" />
      <path className="a-dash" style={d(4)} d="M166 227 C 220 227, 230 190, 262 190" fill="none" stroke={C} strokeWidth="2" strokeDasharray="5 7" />
      <g className="a-rise" style={d(5)}>
        <rect x="262" y="70" width="178" height="220" rx="14" fill="#fff" stroke={LINE} />
        <text x="282" y="98" fill={INK} fontSize="14" fontWeight="600">
          Extracted
        </text>
        {["Supplier", "Total", "Due date"].map((k, i) => (
          <g key={k}>
            <text x="282" y={128 + i * 52} fill={MUTED} fontSize="11" style={mono}>
              {k}
            </text>
            <rect x="282" y={136 + i * 52} width={[110, 80, 96][i]} height="9" rx="4.5" fill={INK} />
            <rect x="282" y={151 + i * 52} width="136" height="4" rx="2" fill={SOFT} />
            <rect className="a-fill" style={d(6 + i)} x="282" y={151 + i * 52} width={[126, 132, 104][i]} height="4" rx="2" fill={C} />
          </g>
        ))}
      </g>
      <g className="a-pop" style={d(9)}>
        <rect x="372" y="84" width="54" height="22" rx="11" fill={C} />
        <text x="383" y="99" fontSize="11" fill="#fff" style={mono}>
          p. 2
        </text>
      </g>
    </Frame>
  );
}

/** S5 · scattered sources flow into one place, and the numbers become a chart. */
function Data() {
  const bars = [52, 78, 64, 102, 88, 124];
  return (
    <Frame>
      {[70, 160, 250].map((y, i) => (
        <g key={y} className="a-rise" style={d(i)}>
          <ellipse cx="74" cy={y} rx="30" ry="9" fill={SOFT} stroke={LINE} />
          <path d={`M44 ${y}v34a30 9 0 0 0 60 0v-34`} fill={SOFT} stroke={LINE} />
          <ellipse cx="74" cy={y} rx="30" ry="9" fill="#fff" stroke={LINE} />
        </g>
      ))}
      {[87, 177, 267].map((y, i) => (
        <path key={y} className="a-dash" style={d(3 + i)} d={`M106 ${y} C 140 ${y}, 150 180, 184 180`} fill="none" stroke={C} strokeWidth="2.5" strokeDasharray="5 7" />
      ))}
      <g className="a-pop" style={d(4)}>
        <rect x="184" y="146" width="64" height="68" rx="12" fill={C} />
        <rect x="198" y="164" width="36" height="6" rx="3" fill="#fff" fillOpacity="0.9" />
        <rect x="198" y="177" width="28" height="6" rx="3" fill="#fff" fillOpacity="0.7" />
        <rect x="198" y="190" width="32" height="6" rx="3" fill="#fff" fillOpacity="0.7" />
      </g>
      <path className="a-dash" style={d(5)} d="M248 180 H 280" fill="none" stroke={C} strokeWidth="2.5" strokeDasharray="5 7" />
      <g className="a-rise" style={d(5)}>
        <rect x="280" y="70" width="166" height="220" rx="14" fill="#fff" stroke={LINE} />
        <rect x="298" y="90" width="70" height="8" rx="4" fill={INK} />
        <text x="298" y="122" fontSize="11" fill={MUTED} style={mono}>
          one view of it all
        </text>
      </g>
      {bars.map((h, i) => (
        <rect key={i} className="a-grow" style={d(6 + i)} x={300 + i * 22} y={270 - h} width="14" height={h} rx="3" fill={i === bars.length - 1 ? C : "#dedede"} />
      ))}
    </Frame>
  );
}

/** S6 · an assessment in plain terms: what we found, how serious, and that it's fixed. */
function Assess() {
  const rows = [
    { k: "High", c: "#d23c3c" },
    { k: "Medium", c: "#f08c00" },
    { k: "Medium", c: "#f08c00" },
    { k: "Low", c: "#0d1b2a" },
  ];
  return (
    <Frame>
      <g className="a-rise" style={d(0)}>
        <rect x="56" y="30" width="368" height="300" rx="14" fill="#fff" stroke={LINE} />
        <path d="M92 58l22-8 22 8v16c0 14-10 24-22 28-12-4-22-14-22-28z" fill={C} fillOpacity="0.16" stroke={C} strokeWidth="2" />
        <text x="152" y="72" fill={INK} fontSize="16" fontWeight="600">
          Findings, by priority
        </text>
        <text x="152" y="92" fill={MUTED} fontSize="11" style={mono}>
          what to fix first
        </text>
      </g>
      {rows.map((r, i) => (
        <g key={i} className="a-rise" style={d(1 + i)}>
          <rect x="80" y={124 + i * 44} width="320" height="34" rx="10" fill={SOFT} />
          <rect x="92" y={132 + i * 44} width="62" height="18" rx="9" fill={r.c} />
          <text x={r.k === "Medium" ? 99 : 108} y={145 + i * 44} fontSize="10.5" fill="#fff" style={mono}>
            {r.k}
          </text>
          <rect x="168" y={138 + i * 44} width={[150, 120, 136, 100][i]} height="7" rx="3.5" fill={INK} fillOpacity="0.75" />
        </g>
      ))}
      {rows.map((_, i) => (
        <Check key={i} x={378} y={141 + i * 44} n={6 + i} />
      ))}
      <g className="a-pop" style={d(11)}>
        <rect x="290" y="300" width="112" height="24" rx="12" fill={INK} />
        <text x="306" y="316" fontSize="11" fill="#fff" style={mono}>
          retested ✓
        </text>
      </g>
    </Frame>
  );
}

/** S7 · watching around the clock: a spike is caught, looked at, and closed. */
function Ops() {
  const beat = "M40 190 H130 L142 170 L154 206 L168 190 H216 L228 116 L242 244 L256 190 H320 L332 176 L344 200 L356 190 H440";
  return (
    <Frame>
      <g className="a-rise" style={d(0)}>
        <rect x="24" y="40" width="432" height="240" rx="14" fill={INK} />
        {[100, 150, 200, 250].map((y) => (
          <line key={y} x1="24" y1={y} x2="456" y2={y} stroke="#ffffff" strokeOpacity="0.06" />
        ))}
        <circle cx="48" cy="64" r="5" fill="#5c5c5c" />
        <text x="60" y="68" fontSize="11" fill="#fff" fillOpacity="0.7" style={mono}>
          24/7 monitoring
        </text>
      </g>
      <path className="a-draw" style={d(1, { "--len": 560, strokeDasharray: 560 })} d={beat} fill="none" stroke="#5c5c5c" strokeWidth="2.5" strokeLinejoin="round" />
      <circle className="a-pulse" style={d(4)} cx="235" cy="120" r="14" fill={C} />
      <circle className="a-pop" style={d(4)} cx="235" cy="120" r="6" fill={C} />
      {["Alert", "Triage", "Resolved"].map((k, i) => (
        <g key={k} className="a-rise" style={d(6 + i * 2)}>
          <rect x={48 + i * 136} y="300" width="120" height="34" rx="17" fill={i === 2 ? C : "#fff"} stroke={i === 2 ? "none" : LINE} />
          <text x={72 + i * 136} y="321" fontSize="12" fill={i === 2 ? "#fff" : INK} style={mono}>
            {`${i + 1} · ${k}`}
          </text>
        </g>
      ))}
    </Frame>
  );
}

/** S8 · a release pipeline: build, test, scan, deploy, without anyone babysitting it. */
function Cloud() {
  const steps = ["Build", "Test", "Scan", "Deploy"];
  return (
    <Frame>
      <g className="a-rise" style={d(0)}>
        <path d="M318 96a34 34 0 0 1 66-10 26 26 0 1 1 8 52H322a28 28 0 0 1-4-42z" fill={C} fillOpacity="0.14" stroke={C} strokeWidth="2" />
        <text x="336" y="126" fontSize="12" fill={INK} style={mono}>
          live
        </text>
      </g>
      <line className="a-rise" style={d(1)} x1="70" y1="220" x2="410" y2="220" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      {steps.map((s, i) => (
        <g key={s} className="a-rise" style={d(1 + i)}>
          <circle cx={70 + i * 113} cy="220" r="26" fill="#fff" stroke={LINE} strokeWidth="2" />
          <text x={70 + i * 113} y="274" textAnchor="middle" fontSize="12" fill={INK} style={mono}>
            {s}
          </text>
        </g>
      ))}
      <circle className="a-travel" style={d(5, { "--dx": "339px" })} cx="70" cy="220" r="11" fill={C} />
      {steps.map((s, i) => (
        <Check key={s} x={70 + i * 113} y={220} n={6 + i * 2} r={11} />
      ))}
      <g className="a-rise" style={d(3)}>
        <rect x="56" y="60" width="200" height="86" rx="12" fill={INK} />
        <text x="72" y="88" fontSize="11" fill="#5c5c5c" style={mono}>
          $ git push
        </text>
        <text x="72" y="108" fontSize="11" fill="#fff" fillOpacity="0.7" style={mono}>
          ✓ pipeline passed
        </text>
        <text x="72" y="128" fontSize="11" fill="#fff" fillOpacity="0.7" style={mono}>
          ✓ released
        </text>
      </g>
    </Frame>
  );
}

/** S9 · the systems you already have, talking to each other through one hub. */
function Integrate() {
  const nodes = [
    { k: "CRM", x: 90, y: 90 },
    { k: "ERP", x: 390, y: 90 },
    { k: "Store", x: 90, y: 270 },
    { k: "Bank", x: 390, y: 270 },
  ];
  return (
    <Frame>
      {nodes.map((n, i) => (
        <path key={n.k} className="a-dash" style={d(2 + i)} d={`M${n.x} ${n.y} L240 180`} fill="none" stroke={C} strokeWidth="2.5" strokeDasharray="6 8" />
      ))}
      {nodes.map((n, i) => (
        <g key={n.k} className="a-rise" style={d(i)}>
          <rect x={n.x - 52} y={n.y - 26} width="104" height="52" rx="14" fill="#fff" stroke={LINE} />
          <circle cx={n.x - 28} cy={n.y} r="10" fill={["#0d1b2a", "#5c5c5c", "#9a9a9a", "#3d3d3d"][i]} />
          <text x={n.x - 12} y={n.y + 5} fontSize="13" fill={INK} style={mono}>
            {n.k}
          </text>
        </g>
      ))}
      <g className="a-pop" style={d(5)}>
        <circle cx="240" cy="180" r="44" fill={C} />
        <circle cx="240" cy="180" r="58" fill="none" stroke={C} strokeOpacity="0.25" strokeWidth="10" />
        <text x="240" y="186" textAnchor="middle" fontSize="15" fontWeight="600" fill="#fff" style={mono}>
          API
        </text>
      </g>
    </Frame>
  );
}

/** S10 · after launch: tickets come in, get answered inside the agreed time. */
function Support() {
  const tickets = [
    { k: "Done", c: "#5c5c5c" },
    { k: "Done", c: "#5c5c5c" },
    { k: "In progress", c: "#3d3d3d" },
    { k: "New", c: "#0d1b2a" },
  ];
  return (
    <Frame>
      <g className="a-rise" style={d(0)}>
        <circle cx="120" cy="170" r="70" fill="none" stroke={SOFT} strokeWidth="14" />
      </g>
      <circle
        className="a-draw"
        style={d(1, { "--len": 440, "--to": 70, strokeDasharray: 440 })}
        cx="120"
        cy="170"
        r="70"
        fill="none"
        stroke={C}
        strokeWidth="14"
        strokeLinecap="round"
        transform="rotate(-90 120 170)"
        strokeDashoffset="70"
      />
      <g className="a-pop" style={d(3)}>
        <text x="120" y="166" textAnchor="middle" fontSize="22" fontWeight="600" fill={INK} style={mono}>
          SLA
        </text>
        <text x="120" y="188" textAnchor="middle" fontSize="11" fill={MUTED} style={mono}>
          on time
        </text>
      </g>
      {tickets.map((t, i) => (
        <g key={i} className="a-rise" style={d(2 + i)}>
          <rect x="222" y={66 + i * 60} width="226" height="48" rx="12" fill="#fff" stroke={LINE} />
          <rect x="238" y={80 + i * 60} width={[90, 110, 80, 100][i]} height="8" rx="4" fill={INK} />
          <rect x="238" y={94 + i * 60} width="60" height="6" rx="3" fill={MUTED} />
          <rect x={t.k === "In progress" ? 340 : 374} y={78 + i * 60} width={t.k === "In progress" ? 94 : 60} height="22" rx="11" fill={t.c} fillOpacity="0.14" />
          <text x={t.k === "In progress" ? 350 : 386} y={93 + i * 60} fontSize="10.5" fill={t.c} style={mono}>
            {t.k}
          </text>
        </g>
      ))}
    </Frame>
  );
}


/** S11 · ERP: finance, stock, sales and people feeding one shared core. */
function Erp() {
  const mods = [
    { k: "Finance", x: 40, y: 40, c: "#0d1b2a" },
    { k: "Inventory", x: 300, y: 40, c: "#5c5c5c" },
    { k: "Sales", x: 40, y: 230, c: "#3d3d3d" },
    { k: "HR", x: 300, y: 230, c: "#9a9a9a" },
  ];
  return (
    <Frame>
      {mods.map((m, i) => (
        <path
          key={m.k}
          className="a-dash"
          style={d(4 + i)}
          d={`M${m.x + 70} ${m.y + 45} L240 180`}
          fill="none"
          stroke={C}
          strokeWidth="2.5"
          strokeDasharray="5 7"
        />
      ))}
      {mods.map((m, i) => (
        <g key={m.k} className="a-rise" style={d(i)}>
          <rect x={m.x} y={m.y} width="140" height="90" rx="14" fill="#fff" stroke={LINE} />
          <circle cx={m.x + 20} cy={m.y + 22} r="7" fill={m.c} />
          <text x={m.x + 34} y={m.y + 27} fontSize="12" fill={INK} style={mono}>
            {m.k}
          </text>
          <rect x={m.x + 14} y={m.y + 44} width="112" height="6" rx="3" fill={SOFT} />
          <rect className="a-fill" style={d(5 + i)} x={m.x + 14} y={m.y + 44} width={[84, 60, 98, 70][i]} height="6" rx="3" fill={m.c} />
          <rect x={m.x + 14} y={m.y + 60} width="70" height="6" rx="3" fill={MUTED} fillOpacity="0.6" />
          <rect x={m.x + 92} y={m.y + 58} width="34" height="10" rx="5" fill={m.c} fillOpacity="0.15" />
        </g>
      ))}
      <g className="a-pop" style={d(3)}>
        <ellipse cx="240" cy="160" rx="46" ry="13" fill={C} />
        <path d="M194 160v42a46 13 0 0 0 92 0v-42" fill={C} />
        <ellipse cx="240" cy="160" rx="46" ry="13" fill="#fff" fillOpacity="0.25" />
        <path d="M194 181a46 13 0 0 0 92 0" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
        <text x="240" y="200" textAnchor="middle" fontSize="15" fontWeight="600" fill="#fff" style={mono}>
          ERP
        </text>
      </g>
    </Frame>
  );
}

export const SERVICE_ART: Record<string, () => ReactNode> = {
  S1: Web,
  S2: App,
  S3: Mobile,
  S4: Ai,
  S5: Data,
  S6: Assess,
  S7: Ops,
  S8: Cloud,
  S9: Integrate,
  S10: Support,
  S11: Erp,
};

/**
 * Accent per service. The brand has one accent, Signal Blue, so every line
 * uses it; the diagrams bring in Deep Teal as their second series.
 */
const BLUE = "#0d1b2a";
export const SERVICE_ACCENT: Record<string, string> = Object.fromEntries(
  ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11"].map((c) => [c, BLUE]),
);
