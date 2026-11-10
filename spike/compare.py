"""Compare library outputs against pyswisseph reference. Differences in arcminutes."""
import json
import sys

TOL = 1.0  # arcminute


def diff(a, b):
    d = abs((a - b + 180) % 360 - 180)
    return d * 60


ref = json.load(open("out/ref.json"))["births"]
files = sys.argv[1:]
lines = []
for fn in files:
    data = json.load(open(fn))
    lines.append(f"\n### {data['lib']}  (avg {data['avg_ms']:.1f} ms / chart)\n")
    lines.append("| Birth | UTC ok | Max planet Δ′ | Worst point | Nodes/Lilith/Chiron Δ′ | PoF Δ′ | ASC Δ′ | MC Δ′ | Max cusp Δ′ (P/K/W/A) | Pass |")
    lines.append("|---|---|---|---|---|---|---|---|---|---|")
    for bid, r in ref.items():
        o = data["births"][bid]
        planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]
        pd = {k: diff(o["bodies"][k]["lon"], r["bodies"][k]["lon"]) for k in planets}
        extra = {}
        for k in ["TrueNode", "MeanNode", "MeanLilith", "Chiron"]:
            if o["bodies"].get(k):
                extra[k] = diff(o["bodies"][k]["lon"], r["bodies"][k]["lon"])
        pof = diff(o["bodies"]["PartOfFortune"]["lon"], r["bodies"]["PartOfFortune"]["lon"]) \
            if o["bodies"].get("PartOfFortune") else None
        asc = diff(o["houses"]["P"]["asc"], r["houses"]["P"]["asc"])
        mc = diff(o["houses"]["P"]["mc"], r["houses"]["P"]["mc"])
        cusp = {c: max(diff(x, y) for x, y in zip(o["houses"][c]["cusps"], r["houses"][c]["cusps"]))
                for c in ["P", "K", "W", "A"]}
        worst = max({**pd, **extra}, key=lambda k: {**pd, **extra}[k])
        all_vals = list(pd.values()) + list(extra.values()) + [asc, mc] + list(cusp.values())
        ok = all(v < TOL for v in all_vals)
        ex = ", ".join(f"{k} {v:.3f}" for k, v in extra.items())
        pof_s = f"{pof:.3f}" if pof is not None else "—"
        lines.append(
            f"| {bid} | {'✅' if o['utc'] == r['utc'] else '❌ ' + o['utc']} | {max(pd.values()):.3f} | {worst} "
            f"| {ex} | {pof_s} | {asc:.3f} | {mc:.3f} | "
            f"{' / '.join(f'{cusp[c]:.3f}' for c in 'PKWA')} | {'✅' if ok else '❌'} |")
print("\n".join(lines))
