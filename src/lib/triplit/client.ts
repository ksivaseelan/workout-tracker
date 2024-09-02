import { TriplitClient } from '@triplit/client';
import { schema } from '../../../triplit/schema';
import { PUBLIC_TRIPLIT_SERVER_URL, PUBLIC_TRIPLIT_TOKEN } from '$env/static/public';
import { browser } from '$app/environment';

// The TriplitClient has 4 main options
// - storage: The storage engine you want to use. This can be
//   'memory' or 'indexeddb'.
// - schema: The schema you defined for your app, which
//   will be used to generate types for client methods
//   and handle local database operations
// - serverUrl: The URL of your Triplit server
// - token: The token you got from the Triplit dashboard
//
// Without the serverUrl or token, the client will operate in
// offline mode
export const triplit = new TriplitClient({
	storage: 'indexeddb',
	schema,
	serverUrl: 'https://031fb427-af0f-4bb9-ab1d-ff3621f6dbf7.triplit.io',
	token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ4LXRyaXBsaXQtdG9rZW4tdHlwZSI6InNlY3JldCIsImlhdCI6MTcyNDg2NjI4Nn0.BvTMV0refl2BIdDBWksOYWytcYDhXkvYLE18euSoTxlR3zYoB61zrtv-HcNibZonPfmlBXPYQsns0kM1m7VwkIylv0shIeR4Jb3U2s3TmkYmim2Ddh092zzCJ91AhlLhkKAhmIYvifWhDZKYpoW9VrFu83TRLaOAgG0RNdNTblTcJJPT0bjTeXvL3mkyN_ivqI31CbR00BqjrWaRhE2FYtvfAAWPhuY3p1lC3yuC2dxDCR5rnvEO2MIzZCbzQLuDYQrP97UazNu-nu29N3XqA_mvMxOOv-tUvpuzGD6gtrNqJPAmKZv6GzYkCszMP7C8OTw0P2LH0u1iiGCw7G57rJ7qb6PzFYSKrmkayIF3ziS7MebcRJgC9VUQ-S0BKXbT7scZncUCw81C9TqFvSnmmZEcUr4onIRu-24TcT3WURNeBI6nhyMi2IOx84H0BlYjoXr1hbuf3yr9nb1CZmmrfdO0WvEd0Ynn_DHaUXEEMKT3y0CVOB0eG8Nqv5JnSUsRQCqsCvEAWqIaDHU3oGvv65MHCcbfxr1318H-uc4KkZUYMn-E4kuCQ2SMD6d1Vw9Zlf3cAdam4XC9ZoDcvlmHFpFeQ4SeZzlNONSy4XjfKlFqz_Br9d8IUQGZoSsXrfwVSOArTupLJYDDk0GO3sW8pz835FDlwbCgRtyqrVwIpHU',
	autoConnect: browser
});

// export const triplit = new TriplitClient({
//   storage: 'indexeddb',
//   schema,
//   serverUrl: PUBLIC_TRIPLIT_SERVER_URL,
//   token: PUBLIC_TRIPLIT_TOKEN,
//   autoConnect: browser,
// });
