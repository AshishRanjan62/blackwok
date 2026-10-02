// Creates a Razorpay Payment Link with a FIXED amount (customer cannot change it)
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const { amount, ref, table } = await req.json();
  const paise = Math.round(Number(amount) * 100);
  if (!(paise >= 100 && paise <= 10000000)) return Response.json({ error: 'bad amount' }, { status: 400 });
  const auth = Buffer.from(process.env.RZP_KEY_ID + ':' + process.env.RZP_KEY_SECRET).toString('base64');
  const r = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: paise,
      currency: 'INR',
      accept_partial: false,
      reference_id: String(ref),
      description: `The BlackWok - Table ${table}`,
      callback_url: `${process.env.SITE_URL}/api/payment-return`,
      callback_method: 'get',
      notes: { table: String(table) },
    }),
  });
  const d = await r.json();
  if (!d.short_url) return Response.json({ error: d }, { status: 502 });
  return Response.json({ url: d.short_url });
};
export const config = { path: '/api/create-link' };
