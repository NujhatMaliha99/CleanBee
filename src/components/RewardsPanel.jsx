import { useCallback, useEffect, useState } from "react";
import { rewardApi } from "../services/api";
import "./RewardsPanel.css";

const newRequestKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

export default function RewardsPanel({ onBalanceChange }) {
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(newRequestKey);

  const load = useCallback(async () => {
    try {
      const [rewardResponse, historyResponse] = await Promise.all([rewardApi.getAll(), rewardApi.getHistory()]);
      setError("");
      setRewards(rewardResponse.data || []);
      setHistory(historyResponse.data?.data || []);
    } catch (loadError) {
      setError(loadError.message || "Could not load rewards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const redeem = async (reward) => {
    setBusyId(reward.id);
    setMessage("");
    setError("");
    try {
      const response = await rewardApi.redeem(reward.id, requestKey);
      onBalanceChange?.(response.points);
      setMessage(`${reward.name} redeemed successfully.`);
      setRequestKey(newRequestKey());
      setLoading(true);
      await load();
    } catch (redeemError) {
      setError(redeemError.message || "Could not redeem this reward.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="db-card rewards-panel">
      <h3>Eco Rewards</h3>
      {loading && <p role="status">Loading rewards…</p>}
      {error && <p className="rewards-error" role="alert">{error}</p>}
      {message && <p className="rewards-success" role="status">{message}</p>}
      {!loading && !error && rewards.length === 0 && <p>No active rewards right now.</p>}
      <div className="rewards-list">
        {rewards.map((reward) => (
          <div className="reward-row" key={reward.id}>
            <div><strong>{reward.name}</strong><span>{reward.points_required} eco points</span></div>
            <button type="button" onClick={() => redeem(reward)} disabled={busyId !== null}>
              {busyId === reward.id ? "Redeeming…" : "Redeem"}
            </button>
          </div>
        ))}
      </div>
      <h4>Redemption history</h4>
      {!loading && history.length === 0 && <p>No rewards redeemed yet.</p>}
      <ul className="redemption-history">
        {history.map((redemption) => <li key={redemption.id}>{redemption.reward?.name || "Reward"} · {redemption.points_spent} points · {new Date(redemption.redeemed_at).toLocaleDateString()}</li>)}
      </ul>
    </section>
  );
}
