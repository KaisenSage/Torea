// upstash-keepalive.js
// This script pings your Upstash Redis database to keep it active.
// Replace the placeholders with your actual Upstash REST endpoint and token.


import fetch from 'node-fetch';


// Use environment variables for security
const UPSTASH_REST_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://literate-ray-67019.upstash.io';
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAAQXLAAIncDJmMjRmYjVlMWFhNzk0MjQxYjhmNDhkNjQ1ZTdkNDUyZHAyNjcwMTk';

async function keepAlive() {
  const res = await fetch(`${UPSTASH_REST_URL}/ping`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  });
  const data = await res.text();
  console.log('Upstash ping response:', data);
}

keepAlive();