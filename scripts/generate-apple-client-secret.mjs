#!/usr/bin/env node

import { createSign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

function usage() {
  console.error(`Usage:
node scripts/generate-apple-client-secret.mjs \\
  --team-id TEAM_ID \\
  --key-id KEY_ID \\
  --client-id com.wizpulseai.auth \\
  --private-key /secure/path/AuthKey_KEYID.p8 \\
  [--days 180] \\
  [--out /secure/path/apple-client-secret.jwt]
`);
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = argv[i + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    args[key] = value;
    i += 1;
  }

  return args;
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function readDerLength(buffer, offset) {
  const first = buffer[offset];

  if (first < 0x80) {
    return { length: first, offset: offset + 1 };
  }

  const byteCount = first & 0x7f;
  let length = 0;

  for (let i = 0; i < byteCount; i += 1) {
    length = (length << 8) + buffer[offset + 1 + i];
  }

  return { length, offset: offset + 1 + byteCount };
}

function derToJose(signature) {
  let offset = 0;

  if (signature[offset] !== 0x30) {
    throw new Error('Invalid ECDSA signature: expected DER sequence.');
  }

  offset += 1;
  const sequence = readDerLength(signature, offset);
  offset = sequence.offset;

  const parts = [];

  for (let index = 0; index < 2; index += 1) {
    if (signature[offset] !== 0x02) {
      throw new Error('Invalid ECDSA signature: expected integer.');
    }

    offset += 1;
    const integer = readDerLength(signature, offset);
    offset = integer.offset;

    let value = signature.subarray(offset, offset + integer.length);
    offset += integer.length;

    while (value.length > 0 && value[0] === 0x00) {
      value = value.subarray(1);
    }

    if (value.length > 32) {
      throw new Error('Invalid ECDSA signature: integer is too large for ES256.');
    }

    parts.push(Buffer.concat([Buffer.alloc(32 - value.length), value]));
  }

  return Buffer.concat(parts);
}

function main() {
  let args;

  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    usage();
    process.exit(1);
  }

  const required = ['team-id', 'key-id', 'client-id', 'private-key'];
  const missing = required.filter((key) => !args[key]);

  if (missing.length > 0) {
    console.error(`Missing required args: ${missing.map((key) => `--${key}`).join(', ')}`);
    usage();
    process.exit(1);
  }

  const days = Number.parseInt(args.days ?? '180', 10);

  if (!Number.isFinite(days) || days < 1 || days > 180) {
    console.error('--days must be between 1 and 180. Apple client secrets cannot exceed 6 months.');
    process.exit(1);
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: args['team-id'],
    iat: now,
    exp: now + days * 24 * 60 * 60,
    aud: 'https://appleid.apple.com',
    sub: args['client-id'],
  };
  const header = {
    alg: 'ES256',
    kid: args['key-id'],
  };

  const privateKey = readFileSync(args['private-key'], 'utf8');
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signer = createSign('SHA256');
  signer.update(signingInput);
  signer.end();

  const derSignature = signer.sign(privateKey);
  const jwt = `${signingInput}.${base64url(derToJose(derSignature))}`;

  if (args.out) {
    writeFileSync(args.out, `${jwt}\n`, { mode: 0o600 });
    console.error(`Apple client secret written to ${args.out}`);
    return;
  }

  process.stdout.write(`${jwt}\n`);
}

main();
