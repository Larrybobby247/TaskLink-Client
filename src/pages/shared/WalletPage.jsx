import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { walletApi, withdrawalsApi } from '../../api/orders.js';
import { formatNaira, nairaToKobo } from '../../utils/money.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const TYPE_LABELS = {
  TASK_EARNING: 'Earning', PLATFORM_FEE: 'Platform fee', WITHDRAWAL: 'Withdrawal',
  REFUND: 'Refund', ADJUSTMENT: 'Adjustment', BONUS: 'Bonus', SUBSCRIPTION_PAYMENT: 'Subscription',
};

const emptyBankForm = { bankName: '', accountNumber: '', accountName: '' };

export default function WalletPage() {
  const { user, updateLocalUser } = useAuth();
  const [balanceKobo, setBalanceKobo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const savedBankDetails = user?.bankDetails;

  useEffect(() => {
    setBankForm({
      bankName: savedBankDetails?.bankName || '',
      accountNumber: savedBankDetails?.accountNumber || '',
      accountName: savedBankDetails?.accountName || '',
    });
  }, [savedBankDetails?.bankName, savedBankDetails?.accountNumber, savedBankDetails?.accountName]);

  const load = () => {
    walletApi.get().then((res) => setBalanceKobo(res.data.balanceKobo));
    walletApi.transactions(filter !== 'ALL' ? { type: filter } : {}).then((res) => setTransactions(res.data));
  };
  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  const setBankField = (field, value) => {
    setBankForm((current) => ({ ...current, [field]: value }));
  };

  const requestWithdrawal = async (event) => {
    event.preventDefault();
    setError('');

    if (!bankForm.bankName.trim() || !/^\d{10}$/.test(bankForm.accountNumber) || !bankForm.accountName.trim()) {
      setError('Enter a bank name, a valid 10-digit account number, and the account name.');
      return;
    }

    setBusy(true);
    try {
      // Save/update the destination account before creating the withdrawal.
      const bankResponse = await withdrawalsApi.addBankAccount({
        bankName: bankForm.bankName.trim(),
        accountNumber: bankForm.accountNumber,
        accountName: bankForm.accountName.trim(),
      });
      const savedUser = bankResponse.data?.user;
      const savedDetails = bankResponse.data?.bankDetails || savedUser?.bankDetails || bankForm;
      updateLocalUser(savedUser || { bankDetails: savedDetails });

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

  if (balanceKobo === null) return <div className="flex justify-center py-16"><Spinner size={32} /></div>;

  return (
    <div className="space-y-5 pb-10">
      <h1 className="text-xl font-bold text-brand-navy">Wallet</h1>

      <div className="bg-brand-navy text-white rounded-2xl p-6">
        <p className="text-xs text-white/70">Available balance</p>
        <p className="text-3xl font-bold mt-1">{formatNaira(balanceKobo)}</p>
        <button onClick={() => { setError(''); setShowWithdraw(true); }} className="bg-white text-brand-navy font-semibold rounded-xl px-5 py-2.5 mt-4 text-sm">
          Withdraw
        </button>
      </div>

      <div className="card p-5 space-y-3">
        <div>
          <h2 className="font-semibold text-brand-navy">Withdrawal account</h2>
          <p className="text-sm text-gray-500 mt-1">Save the bank account where your TaskLink earnings should be sent.</p>
        </div>
        {savedBankDetails?.accountNumber ? (
          <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-800">
            <p className="font-medium">{savedBankDetails.bankName}</p>
            <p>{savedBankDetails.accountName} · ****{savedBankDetails.accountNumber.slice(-4)}</p>
          </div>
        ) : (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">Add your bank details before requesting a withdrawal.</p>
        )}
        <button type="button" onClick={() => { setError(''); setShowWithdraw(true); }} className="btn-secondary w-full">
          {savedBankDetails?.accountNumber ? 'Edit bank account' : 'Add bank account'}
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
          <form onSubmit={requestWithdrawal} className="bg-white rounded-t-2xl md:rounded-2xl p-6 w-full max-w-sm space-y-3">
            <h3 className="font-bold text-brand-navy">Withdraw funds</h3>
            <p className="text-xs text-gray-500">Confirm your bank account and enter the amount to withdraw.</p>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
            <input className="input-field" placeholder="Bank name" value={bankForm.bankName} onChange={(e) => setBankField('bankName', e.target.value)} required />
            <input className="input-field" inputMode="numeric" maxLength={10} placeholder="10-digit account number" value={bankForm.accountNumber} onChange={(e) => setBankField('accountNumber', e.target.value.replace(/\D/g, ''))} required />
            <input className="input-field" placeholder="Account name" value={bankForm.accountName} onChange={(e) => setBankField('accountName', e.target.value)} required />
            <input className="input-field" type="number" min="1" placeholder="Amount (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowWithdraw(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={busy || !amount} className="btn-primary flex-1">{busy ? 'Processing...' : 'Withdraw'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
