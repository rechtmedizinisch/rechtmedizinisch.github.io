/** Ask Google to choose an identity without signing out the browser profile. */
export async function startGoogleLogin(client, redirectTo) {
  const {error} = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {redirectTo, queryParams: {prompt: 'select_account'}}
  });
  if (error) throw error;
}
