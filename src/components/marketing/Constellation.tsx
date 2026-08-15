const NODES = [
  { x: 8, y: 20 }, { x: 22, y: 12 }, { x: 18, y: 38 }, { x: 35, y: 24 },
  { x: 48, y: 10 }, { x: 55, y: 32 }, { x: 68, y: 18 }, { x: 78, y: 30 },
  { x: 90, y: 14 }, { x: 30, y: 55 }, { x: 45, y: 48 }, { x: 62, y: 52 },
  { x: 75, y: 46 }, { x: 12, y: 62 }, { x: 85, y: 60 }, { x: 52, y: 70 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 3], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [3, 10], [9, 10], [10, 11], [11, 12], [1, 2], [9, 13], [11, 15], [12, 14],
];

export function Constellation({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeWidth={0.15}
        />
      ))}
      {NODES.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i % 3 === 0 ? 0.6 : 0.35} fill="currentColor" fillOpacity={0.5} />
      ))}
    </svg>
  );
}
