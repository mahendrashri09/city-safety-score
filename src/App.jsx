import { useState } from "react";

const FREE_LIMIT = 999;
const RZP_KEY = "rzp_test_XXXXXXXXXXXX"; // ← replace with your Razorpay key_id

// ── helpers ──────────────────────────────────────────────────────────────────

function getTodayKey() {
  return "css_uses_" + new Date().toISOString().slice(0, 10);
}

function getUseCount() {
  return parseInt(localStorage.getItem(getTodayKey()) || "0");
}

function incrementUseCount() {
  const k = getTodayKey();
  localStorage.setItem(k, getUseCount() + 1);
}

function getScoreColor(s) {
  if (s >= 70) return "#3B6D11";
  if (s >= 45) return "#BA7517";
  if (s >= 20) return "#A32D2D";
  return "#501313";
}

function getScoreLabel(s) {
  if (s >= 70) return "Relatively Safe";
  if (s >= 45) return "Moderate Risk";
  if (s >= 20) return "High Risk";
  return "Critical Danger";
}

// ── ScoreGauge ────────────────────────────────────────────────────────────────

function ScoreGauge({ score }) {
  const color = getScoreColor(score);
  const r = 70, cx = 100, cy = 100;
  const toRad = d => (d * Math.PI) / 180;
  const arcPath = (from, to) => {
    const pts = [];
    for (let a = from; a <= to; a += 2)
      pts.push(`${cx + r * Math.cos(toRad(a))},${cy + r * Math.sin(toRad(a))}`);
    return `M ${pts.join(" L ")}`;
  };
  const deg = -210 + (score / 100) * 240;
  const needle = { x: cx + (r - 14) * Math.cos(toRad(deg)), y: cy + (r - 14) * Math.sin(toRad(deg)) };
  return (
    <svg viewBox="0 0 200 140" style={{ width: 220, display: "block", margin: "0 auto" }}>
      <path d={arcPath(-210, 30)} fill="none" stroke="#e5e5e3" strokeWidth="10" strokeLinecap="round" />
      <path d={arcPath(-210, deg)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill={color} />
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize="26" fontWeight="500" fill={color}>{score}</text>
      <text x={cx} y={cy + 40} textAnchor="middle" fontSize="10" fill="#888">{getScoreLabel(score)}</text>
    </svg>
  );
}

// ── RiskBar ───────────────────────────────────────────────────────────────────

function RiskBar({ label, score, icon }) {
  const color = getScoreColor(score);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: "#666" }}>{icon} {label}</span>
        <span style={{ fontWeight: 500, color }}>{score}/100</span>
      </div>
      <div style={{ background: "#f0f0ee", borderRadius: 4, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ── UpgradeModal ──────────────────────────────────────────────────────────────

function UpgradeModal({ name, onPay, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "1.75rem", maxWidth: 380, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
        <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 8 }}>Free limit reached</div>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 16 }}>
          You've used your 3 free analyses today. Upgrade to <strong>Premium</strong> for:
        </p>
        <ul style={{ fontSize: 13, color: "#444", lineHeight: 2, marginBottom: 20, paddingLeft: 18 }}>
          <li>Unlimited daily analyses</li>
          <li>Compare up to 5 cities side by side</li>
          <li>PDF safety brief download</li>
          <li>Priority AI response</li>
        </ul>
        <button onClick={onPay} style={{ width: "100%", padding: "10px 0", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer", marginBottom: 10 }}>
          Upgrade — ₹99/month
        </button>
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer" }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ── CityCard ──────────────────────────────────────────────────────────────────

function CityCard({ data, onRemove }) {
  const [open, setOpen] = useState(true);
  const parsed = (() => { try { return typeof data.result === "string" ? JSON.parse(data.result) : data.result; } catch { return null; } })();
  if (!parsed) return null;
  const score = parsed.overall_score ?? 0;
  const color = getScoreColor(score);

  const copyBrief = () => {
    const txt = `City Safety Score — ${data.city}, ${data.country}\nScore: ${score}/100 (${getScoreLabel(score)})\nAdvisory: ${parsed.travel_advisory}\n\n${parsed.advisory}\n\nCheck your city at citysafetyscore.com`;
    navigator.clipboard?.writeText(txt);
    alert("Copied to clipboard!");
  };

  return (
    <div style={{ background: "#fff", border: "0.5px solid #e5e5e3", borderRadius: 14, padding: "1.25rem", marginBottom: 16, position: "relative" }}>
      <button onClick={onRemove} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#aaa" }}>✕</button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🌍</div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15 }}>{data.city}, {data.country}</div>
          <div style={{ fontSize: 12, color }}>Advisory: {parsed.travel_advisory}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 500, color }}>{score}</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>/ 100</div>
        </div>
      </div>

      <ScoreGauge score={score} />

      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "none", border: "0.5px solid #e5e5e3", borderRadius: 8, padding: "6px 0", fontSize: 13, cursor: "pointer", color: "#888", margin: "12px 0 0" }}>
        {open ? "Hide details ▲" : "Show details ▼"}
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 14 }}>
            {(parsed.factors ?? []).map((f, i) => <RiskBar key={i} label={f.name} score={f.score} icon={f.icon ?? "🔹"} />)}
          </div>
          <div style={{ background: "#f9f9f7", borderRadius: 10, padding: "12px 14px", fontSize: 13, lineHeight: 1.7, color: "#555", marginBottom: 12 }}>
            <div style={{ fontWeight: 500, fontSize: 13, color: "#1a1a1a", marginBottom: 6 }}>AI Advisory</div>
            {parsed.advisory}
          </div>
          {(parsed.risk_flags ?? []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#aaa", marginBottom: 6 }}>Active risk indicators</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {parsed.risk_flags.map((f, i) => (
                  <span key={i} style={{ background: "#fff0f0", color: "#a32d2d", fontSize: 11, padding: "3px 10px", borderRadius: 99, border: "0.5px solid #f5c0c0" }}>{f}</span>
                ))}
              </div>
            </div>
          )}
          <button onClick={copyBrief} style={{ width: "100%", background: "none", border: "0.5px solid #e5e5e3", borderRadius: 8, padding: "7px 0", fontSize: 13, cursor: "pointer", color: "#888" }}>
            📋 Copy safety brief
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPremium, setIsPremium] = useState(
    localStorage.getItem("css_premium") === "true"
  );

  // ── Razorpay checkout ──
  const openRazorpay = async () => {
    try {
      // Call WordPress backend to create order
      const orderRes = await fetch(
        "https://YOURWORDPRESSSITE.com/wp-admin/admin-ajax.php?action=create_razorpay_order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 9900 }),
        }
      );
      const order = await orderRes.json();

      const options = {
        key: RZP_KEY,
        amount: order.amount,
        currency: "INR",
        name: "City Safety Score",
        description: "Premium — Unlimited analyses",
        order_id: order.id,
        handler: async function (response) {
          // Verify payment on server
          const verifyRes = await fetch(
            "https://YOURWORDPRESSSITE.com/wp-admin/admin-ajax.php?action=verify_razorpay_payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            }
          );
          const verify = await verifyRes.json();
          if (verify.success) {
            localStorage.setItem("css_premium", "true");
            setIsPremium(true);
            setShowUpgrade(false);
            alert("Payment successful! Premium unlocked 🎉");
          } else {
            alert("Payment verification failed. Contact support.");
          }
        },
        prefill: { name: name || "" },
        theme: { color: "#3B6D11" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      alert("Could not initiate payment. Please try again.");
    }
  };

  // ── Analyze ──
  const analyze = async () => {
    if (!city.trim() || !country.trim()) {
      setError("Please enter both city and country.");
      return;
    }

    // Check free limit
    if (!isPremium && getUseCount() >= FREE_LIMIT) {
      setShowUpgrade(true);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, country }),
      });
      const data = await res.json();

      incrementUseCount();
      setCards(prev => [{ city, country, name, result: data.result, id: Date.now() }, ...prev]);
      setCity("");
      setCountry("");
    } catch {
      setError("Analysis failed. Please try again.");
    }

    setLoading(false);
  };

  const usedToday = getUseCount();
  const remaining = Math.max(0, FREE_LIMIT - usedToday);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem 1rem" }}>
      {showUpgrade && (
        <UpgradeModal name={name} onPay={openRazorpay} onClose={() => setShowUpgrade(false)} />
      )}

      <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>City Safety Score</h1>
      <p style={{ fontSize: 14, color: "#888", margin: "0 0 1.5rem" }}>
        Geopolitical & war risk analysis powered by AI
      </p>

      {/* Free tier badge */}
      {!isPremium && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9f9f7", border: "0.5px solid #e5e5e3", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 13 }}>
          <span style={{ color: "#666" }}>
            {remaining > 0 ? `${remaining} free ${remaining === 1 ? "analysis" : "analyses"} left today` : "Free limit reached today"}
          </span>
          <button onClick={() => setShowUpgrade(true)} style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer" }}>
            Upgrade ₹99/mo
          </button>
        </div>
      )}

      {isPremium && (
        <div style={{ background: "#f0f7e8", border: "0.5px solid #c3e0a0", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 13, color: "#3B6D11" }}>
          ✓ Premium — unlimited analyses active
        </div>
      )}

      {/* Input form */}
      <div style={{ background: "#fff", border: "0.5px solid #e5e5e3", borderRadius: 14, padding: "1.25rem", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Your name (optional)</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arjun" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Country *</label>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. Ukraine" />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>City *</label>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Kharkiv"
            onKeyDown={e => e.key === "Enter" && analyze()}
          />
        </div>
        {error && <p style={{ fontSize: 12, color: "#a32d2d", margin: "0 0 10px" }}>{error}</p>}
        <button
          onClick={analyze}
          disabled={loading}
          style={{ width: "100%", padding: "9px 0", fontWeight: 500, fontSize: 14, background: loading ? "#f0f0ee" : "#1a1a1a", color: loading ? "#888" : "#fff", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Analyzing geopolitical situation..." : "Analyze safety score ↗"}
        </button>
      </div>

      {cards.length > 1 && (
        <div style={{ background: "#f9f9f7", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 13, color: "#888" }}>
          Comparing {cards.length} cities
        </div>
      )}

      {cards.map(c => (
        <CityCard key={c.id} data={c} onRemove={() => setCards(prev => prev.filter(x => x.id !== c.id))} />
      ))}

      {cards.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#aaa", fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌍</div>
          Enter a city and country to get an AI-powered geopolitical safety score
        </div>
      )}

      <p style={{ fontSize: 11, color: "#ccc", textAlign: "center", marginTop: 24 }}>
        For informational purposes only. Always check official government travel advisories.
      </p>
    </div>
  );
}
