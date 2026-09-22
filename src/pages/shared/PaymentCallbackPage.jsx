import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentsApi } from '../../api/orders.js';
import Spinner from '../../components/ui/Spinner.jsx';

export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
  const reference = params.get('reference') || params.get('trxref');

  console.log('PAYSTACK REFERENCE:', reference);

  if (!reference) {
    console.error('No Paystack reference found');
    setStatus('error');
    return;
  }

  paymentsApi.verify(reference)
    .then((res) => {
      console.log('PAYMENT VERIFY RESPONSE:', res.data);

      if (res.data.success === true) {
        setStatus('success');
      } else {
        console.error('Payment verification returned failure:', res.data);
        setStatus('failed');
      }
    })
    .catch((err) => {
      console.error(
        'PAYMENT VERIFICATION ERROR:',
        err.response?.data || err.message
      );
      setStatus('error');
    });
}, [params]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card p-8 text-center max-w-sm">
        {status === 'verifying' && (<><Spinner size={32} className="mx-auto mb-4" /><p>Verifying your payment...</p></>)}
        {status === 'success' && (<><p className="text-2xl mb-2">✅</p><p className="font-semibold text-green-700">Payment confirmed!</p></>)}
        {(status === 'failed' || status === 'error') && (<><p className="text-2xl mb-2">⚠️</p><p className="font-semibold text-red-600">We couldn't confirm this payment.</p></>)}
        <Link to="/client/orders" className="btn-primary mt-5 inline-block">Go to Active Orders</Link>
      </div>
    </div>
  );
}
