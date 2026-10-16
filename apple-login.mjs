// Apple supplies the UI and identity token; only Supabase verifies the token
// and selects the shared account. Never infer identity or access from its claims.
const sdkURL = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/de_DE/appleid.auth.js';
let sdkPromise;
export function loadAppleSDK() {
  if (globalThis.AppleID?.auth) return Promise.resolve(globalThis.AppleID);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = sdkURL; script.async = true; script.referrerPolicy = 'no-referrer';
    const timer = setTimeout(() => fail(), 15000);
    function fail() { clearTimeout(timer); script.remove(); sdkPromise = undefined; reject(new Error('apple_unavailable')); }
    script.onerror = fail;
    script.onload = () => {
      clearTimeout(timer);
      if (globalThis.AppleID?.auth) resolve(globalThis.AppleID); else fail();
    };
    document.head.append(script);
  });
  return sdkPromise;
}
function randomValue(cryptoAPI) {
  const bytes = cryptoAPI.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
}
export async function prepareAppleRequest(settings, load = loadAppleSDK, cryptoAPI = globalThis.crypto) {
  const redirect = new URL(settings.redirectURI);
  if (settings.clientID !== 'de.philippgraef.rechtmedizinisch.web' ||
      redirect.href !== 'https://rechtmedizinisch.github.io/index.html') throw new Error('apple_configuration');
  const nonce = randomValue(cryptoAPI), state = randomValue(cryptoAPI);
  const hash = Array.from(new Uint8Array(await cryptoAPI.subtle.digest('SHA-256', new TextEncoder().encode(nonce))))
    .map(value => value.toString(16).padStart(2, '0')).join('');
  const sdk = await load();
  let used = false;
  return {
    // Start synchronously within the click event so Safari permits the popup.
    start() {
      if (used) throw new Error('apple_request_used');
      used = true;
      sdk.auth.init({clientId: settings.clientID, redirectURI: redirect.href, scope: 'email',
        state, nonce: hash, usePopup: true});
      const responsePromise = sdk.auth.signIn();
      // Browsers can suppress a popup without rejecting Apple's promise.
      let timer;
      const deadline = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('apple_login_timeout')), 180000); });
      return Promise.race([responsePromise, deadline]).finally(() => clearTimeout(timer)).then(response => {
        const value = response?.authorization;
        if (value?.state !== state || ![value.id_token, value.code].every(text =>
            typeof text === 'string' && text.length > 0 && text.length < 12000)) throw new Error('apple_response_invalid');
        return {identityToken: value.id_token, authorizationCode: value.code, nonce};
      });
    }
  };
}
export function completeAppleLogin(client, request) {
  const proof = request.start();
  return proof.then(async value => {
    const {data: current, error: sessionError} = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (current?.session) throw new Error('account_changed');
    const {data, error} = await client.auth.signInWithIdToken({provider: 'apple', token: value.identityToken, nonce: value.nonce});
    if (error) throw error;
    if (!data?.user?.id) throw new Error('apple_response_invalid');
    return data.user;
  });
}
export function isAppleCancellation(error) {
  return ['popup_closed_by_user', 'user_cancelled_authorize', 'access_denied'].includes(error?.error);
}
