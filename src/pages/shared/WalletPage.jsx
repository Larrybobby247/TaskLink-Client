import React, { useEffect, useState } from 'react';
import { walletApi, withdrawalsApi } from '../../api/orders.js';
import { formatNaira, nairaToKobo } from '../../utils/money.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const TYPE_LABELS = {
  TASK_EARNING: 'Earning', PLATFORM_FEE: 'Platform fee', WITHDRAWAL: 'Withdrawal',
  REFUND: 'Refund', ADJUSTMENT: 'Adjustment', BONUS: 'Bonus', SUBSCRIPTION_PAYMENT: 'Subscription',
};

export default function WalletPage() {
  const [balanceKobo, setBalanceKobo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    walletApi.get().then((res) => setBalanceKobo(res.data.balanceKobo));
    walletApi.transactions(filter !== 'ALL' ? { type: filter } : {}).then((res) => setTransactions(res.data));
  };
  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  const requestWithdrawal = async () => {
    setError('');
    setBusy(true);
    try {
      await withdrawalsApi.request(nairaToKobo(amount));
      setShowWithdraw(false);
      setAmount('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (balanceKobo === null) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  return (
    <div className="space-y-5 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">Wallet</h1>

      <div className="bg-brand-navy text-white rounded-2xl p-6">
        <p className="text-xs text-white/70">Available balance</p>
        <p className="text-3xl font-bold mt-1">{formatNaira(balanceKobo)}</p>
        <button onClick={() => setShowWithdraw(true)} className="bg-white text-brand-navy font-semibold rounded-xl px-5 py-2.5 mt-4 text-sm">
          Withdraw
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {['ALL', 'TASK_EARNING', 'WITHDRAWAL', 'REFUND'].map((t) => (
          <button key={t} onClick={() => setFilter(t)} className={`chip whitespace-nowrap ${filter === t ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
            {t === 'ALL' ? 'All' : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {transactions.length ? (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx._id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{tx.description}</p>
                <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
              <p className={`font-semibold ${tx.amountKobo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {tx.amountKobo >= 0 ? '+' : ''}{formatNaira(tx.amountKobo)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Your wallet has no transactions yet." />
      )}

      {showWithdraw && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-brand-navy mb-3">Withdraw funds</h3>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{error}</div>}
            <input className="input-field" type="number" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowWithdraw(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={requestWithdrawal} disabled={busy || !amount} className="btn-primary flex-1">{busy ? 'Processing...' : 'Withdraw'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
