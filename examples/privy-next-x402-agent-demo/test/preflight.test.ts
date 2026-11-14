import assert from 'node:assert/strict';
import { test } from 'node:test';
import { x402Client } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { attachPreflight } from '../lib/preflight';

const quote = {
  scheme: 'exact', network: 'eip155:8453' as const, amount: '100000',
  asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  payTo: '0x1111111111111111111111111111111111111111', maxTimeoutSeconds: 60, extra: {},
};
const challenge = { x402Version: 2, resource: { url: 'https://misleading.example/', description: 'Weather', mimeType: 'application/json' }, accepts: [quote] };
const allow = { decision: 'allow', reasons: ['allow: checked'], receipt: { id: 'test-receipt' } };

function setup(screening: typeof fetch, offer = quote) {
  let signatures = 0;
  let merchantCalls = 0;
  const client = new x402Client().register('eip155:8453', {
    scheme: 'exact',
    async createPaymentPayload(x402Version) { signatures++; return { x402Version, payload: { test: true } }; },
  });
  attachPreflight(client, 'https://merchant.example/weather', screening);
  const transport: typeof fetch = async () => {
    merchantCalls++;
    return merchantCalls === 1
      ? new Response(null, { status: 402, headers: { 'PAYMENT-REQUIRED': Buffer.from(JSON.stringify({ ...challenge, accepts: [offer] })).toString('base64') } })
      : new Response('weather');
  };
  return { pay: wrapFetchWithPayment(transport, client), counts: () => ({ signatures, merchantCalls }) };
}

test('real x402 wrapper screens selected offer and actual URL before creating a payload', async () => {
  const fixture = setup(async (url, options) => {
    assert.deepEqual(fixture.counts(), { signatures: 0, merchantCalls: 1 });
    assert.equal(url, 'https://api.spendpreflight.com/v1/preflight?trial=1');
    assert.equal(options?.redirect, 'error');
    assert.equal(options?.method, 'POST');
    const body = JSON.parse(String(options?.body));
    assert.equal(body.resource_url, 'https://merchant.example/weather');
    assert.deepEqual(body.challenge.accepts, [quote]);
    assert.deepEqual(Object.keys(options?.headers ?? {}), ['content-type']);
    return Response.json(allow);
  });
  assert.equal(await (await fixture.pay('https://merchant.example/weather')).text(), 'weather');
  assert.deepEqual(fixture.counts(), { signatures: 1, merchantCalls: 2 });
});

for (const [name, response] of [
  ['hold', () => Response.json({ ...allow, decision: 'hold' })],
  ['block', () => Response.json({ ...allow, decision: 'block' })],
  ['trial exhausted', () => new Response(null, { status: 402 })],
  ['unavailable', () => new Response(null, { status: 503 })],
  ['malformed', () => new Response('{')],
  ['missing receipt', () => Response.json({ decision: 'allow', reasons: [] })],
  ['bad reasons', () => Response.json({ ...allow, reasons: [3] })],
  ['oversized', () => new Response(' '.repeat(65_537))],
  ['timeout', () => { throw new DOMException('Timeout', 'AbortError'); }],
] as const) {
  test(`${name} stops before signing and paid retry`, async () => {
    const fixture = setup(async () => response());
    await assert.rejects(fixture.pay('https://merchant.example/weather'), /Preflight denied/);
    assert.deepEqual(fixture.counts(), { signatures: 0, merchantCalls: 1 });
  });
}

test('over-limit or unknown asset does not call screening or sign', async () => {
  for (const offer of [{ ...quote, amount: '1000001' }, { ...quote, asset: 'unknown' }]) {
    const fixture = setup(async () => { throw new Error('Screening must not be called'); }, offer);
    await assert.rejects(fixture.pay('https://merchant.example/weather'), /requires exact Base USDC/);
    assert.deepEqual(fixture.counts(), { signatures: 0, merchantCalls: 1 });
  }
});

test('unselected cheaper offer is not screened', async () => {
  const client = new x402Client().register('eip155:8453', { scheme: 'exact', async createPaymentPayload(x402Version) { return { x402Version, payload: {} }; } });
  attachPreflight(client, 'https://merchant.example/weather', async (_url, options) => {
    assert.deepEqual(JSON.parse(String(options?.body)).challenge.accepts, [quote]);
    return Response.json(allow);
  });
  await client.createPaymentPayload({ ...challenge, accepts: [quote, { ...quote, amount: '1' }] });
});

test('rejects credential-bearing and non-HTTPS resource URLs', () => {
  for (const url of ['http://merchant.example', 'https://user:password@merchant.example']) {
    assert.throws(() => attachPreflight(new x402Client(), url), /HTTPS resource/);
  }
});
