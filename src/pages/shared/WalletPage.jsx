import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { walletApi, withdrawalsApi } from '../../api/orders.js';
import { formatNaira, nairaToKobo } from '../../utils/money.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';

const TYPE_LABELS = {
  TASK_EARNING: 'Earning', PLATFORM_FEE: 'Platform fee', WITHDRAWAL: 'Withdrawal',
  REFUND: 'Refund', ADJUSTMENT: 'Adjustment', BONUS: 'Bonus', SUBSCRIPTION_PAYMENT: 'Subscription',
};

const emptyBank = { bankName: '', accountNumber: '', accountName: '' };

export default function WalletPage() {
  const { user, updateLocalUser } = useAuth();
  const [balanceKobo, setBalanceKobo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankForm, setBankForm] = useState(emptyBank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const savedBank = user?.bankDetails;

  useEffect(() => {
    setBankForm({
      bankName: savedBank?.bankName || '',
      accountNumber: savedBank?.accountNumber || '',
      accountName: savedBank?.accountName || '',
    });
  }, [savedBank?.bankName, savedBank?.accountNumber, savedBank?.accountName]);

  const load = () => {
    walletApi.get().then((res) => setBalanceKobo(res.data.balanceKobo));
    walletApi.transactions(filter !== 'ALL' ? { type: filter } : {}).then((res) => setTransactions(res.data));
    withdrawalsApi.mine({}).then((res) => setWithdrawals(res.data || []));
  };
  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  const saveBankDetails = async () => {
    if (!bankForm.bankName.trim() || !bankForm.accountName.trim() || !/^\d{10}$/.test(bankForm.accountNumber)) {
      throw new Error('Enter a bank name, account name, and a valid 10-digit account number.');
    }
    const response = await withdrawalsApi.addBankAccount({
      bankName: bankForm.bankName.trim(),
      accountNumber: bankForm.accountNumber,
      accountName: bankForm.accountName.trim(),
    });
    const savedUser = response.data?.user;
    const bankDetails = response.data?.bankDetails || savedUser?.bankDetails || bankForm;
    updateLocalUser(savedUser || { bankDetails });
  };

  const requestWithdrawal = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await saveBankDetails();
      await withdrawalsApi.request(nairaToKobo(amount));
      setShowWithdraw(false);
      setAmount('');
      load();
    } catch (err) {
      setError(err.errors?.[0]?.message || err.message || 'Unable to process withdrawal.');
    } finally {
      setBusy(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '';
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'PENDING') return 'bg-blue-50 border-blue-200';
    if (statusUpper === 'APPROVED' || statusUpper === 'SUCCESS') return 'bg-green-50 border-green-200';
    if (statusUpper === 'REJECTED' || statusUpper === 'FAILED') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getStatusTextColor = (status) => {
    if (!status) return '';
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'PENDING') return 'text-blue-800';
    if (statusUpper === 'APPROVED' || statusUpper === 'SUCCESS') return 'text-green-800';
    if (statusUpper === 'REJECTED' || statusUpper === 'FAILED') return 'text-red-800';
    return 'text-gray-800';
  };

  if (balanceKobo === null) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  return (
    <div className="space-y-5 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">Wallet</h1>
      <div className="bg-brand-navy text-white rounded-2xl p-6">
        <p className="text-xs text-white/70">Available balance</p>
        <p className="text-3xl font-bold mt-1">{formatNaira(balanceKobo)}</p>
        <button onClick={() => { setError(''); setShowWithdraw(true); }} className="bg-white text-brand-navy font-semibold rounded-xl px-5 py-2.5 mt-4 text-sm">Withdraw</button>
      </div>

      <div className="card p-5 space-y-3">
        <div>
          <h2 className="font-semibold text-brand-navy">Withdrawal account</h2>
          <p className="text-sm text-gray-500 mt-1">Add the bank account where your earnings should be sent.</p>
        </div>
        {savedBank?.accountNumber ? (
          <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-800">
            <p className="font-medium">{savedBank.bankName}</p>
            <p>{savedBank.accountName} · ****{savedBank.accountNumber.slice(-4)}</p>
          </div>
        ) : <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">No bank account saved yet.</p>}
        <button type="button" onClick={() => { setError(''); setShowWithdraw(true); }} className="btn-secondary w-full">{savedBank?.accountNumber ? 'Edit bank account' : 'Add bank account'}</button>
      </div>

      {withdrawals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-brand-navy">Withdrawal Requests</h2>
          {withdrawals.map((w) => (
            <div key={w._id} className={`card p-4 border-l-4 rounded-lg space-y-3 ${getStatusColor(w.status)}`} style={{ borderLeftColor: w.status?.toUpperCase() === 'PENDING' ? '#3B82F6' : w.status?.toUpperCase() === 'APPROVED' || w.status?.toUpperCase() === 'SUCCESS' ? '#10B981' : '#EF4444' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-sm">{formatNaira(w.netAmountKobo || w.amountKobo)}</p>
                    <StatusBadge status={w.status} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Ref:</span> {w.reference || w._id?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Requested:</span> {new Date(w.requestedAt).toLocaleDateString()} at {new Date(w.requestedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="bg-white/50 rounded-lg p-3 space-y-2">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Bank:</span> {w.bankName}
                </p>
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Account:</span> {w.accountName} · ****{w.accountNumberLast4 || w.accountNumber?.slice(-4)}
                </p>
                {w.feeKobo > 0 && (
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Fee:</span> {formatNaira(w.feeKobo)}
                  </p>
                )}
              </div>

              {w.status?.toUpperCase() === 'FAILED' && w.failureReason && (
                <div className="bg-red-100/50 border border-red-300 rounded p-2">
                  <p className="text-xs text-red-700">
                    <span className="font-medium">Failure reason:</span> {w.failureReason}
                  </p>
                </div>
              )}

              {w.status?.toUpperCase() === 'PENDING' && (
                <p className="text-xs text-blue-700 bg-blue-100/50 rounded p-2">
                  ⏳ Your withdrawal request is awaiting admin approval. You'll receive a notification once it's processed.
                </p>
              )}

              {(w.status?.toUpperCase() === 'APPROVED' || w.status?.toUpperCase() === 'SUCCESS') && (
                <p className="text-xs text-green-700 bg-green-100/50 rounded p-2">
                  ✓ Your withdrawal has been approved and processed.
                </p>
              )}

              {w.status?.toUpperCase() === 'REJECTED' && (
                <p className="text-xs text-red-700 bg-red-100/50 rounded p-2">
                  ✗ Your withdrawal request has been rejected. The amount has been returned to your wallet.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {['ALL', 'TASK_EARNING', 'WITHDRAWAL', 'REFUND'].map((t) => <button key={t} onClick={() => setFilter(t)} className={`chip whitespace-nowrap ${filter === t ? 'bg-brand-navy text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{t === 'ALL' ? 'All' : TYPE_LABELS[t] || t}</button>)}
      </div>

      {transactions.length ? (
        <div className="space-y-2">
          <h2 className="font-semibold text-brand-navy text-sm">Transaction History</h2>
          {transactions.map((tx) => (
            <div key={tx._id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm">{TYPE_LABELS[tx.type] || tx.type}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="font-semibold text-brand-navy">{formatNaira(tx.amountKobo)}</p>
            </div>
          ))}
        </div>
      ) : (
        filter === 'ALL' ? <EmptyState title="No transactions yet" /> : <p className="text-center text-gray-500 py-8">No {TYPE_LABELS[filter] || filter.toLowerCase()} found</p>
      )}

      {showWithdraw && <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50"><form onSubmit={requestWithdrawal} className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-sm space-y-3"><h3 className="font-bold text-brand-navy">Withdraw funds</h3><p className="text-xs text-gray-500">Confirm your bank account and enter the amount.</p>{error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}<input className="input-field" placeholder="Bank name" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} required /><input className="input-field" inputMode="numeric" maxLength={10} placeholder="10-digit account number" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '') })} required /><input className="input-field" placeholder="Account name" value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} required /><input className="input-field" type="number" min="1" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} required /><div className="flex gap-3 pt-1"><button type="button" onClick={() => setShowWithdraw(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" disabled={busy || !amount} className="btn-primary flex-1">{busy ? 'Processing...' : 'Withdraw'}</button></div></form></div>}
    </div>
  );
}
