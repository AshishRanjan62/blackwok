// Razorpay sends the customer here after payment. We verify the signature, then send them back to the app.
import crypto from 'crypto';
export default async (req) => {
  const q = new URL(req.url).searchParams;
  const body = [q.get('razorpay_payment_link_id'), q.get('razorpay_payment_link_reference_id'), q.get('razorpay_payment_link_status'), q.get('razorpay_payment_id')].join('|');
  const sig = crypto.createHmac('sha256', process.env.RZP_KEY_SECRET).update(body).digest('hex');
  const ok = sig === q.get('razorpay_signature') && q.get('razorpay_payment_link_status') === 'paid';
  const ref = encodeURIComponent(q.get('razorpay_payment_link_reference_id') || '');
  return Response.redirect(new URL(`/?pay=${ok ? 'ok' : 'fail'}&ref=${ref}`, req.url).toString(), 302);
};
export const config = { path: '/api/payment-return' };
