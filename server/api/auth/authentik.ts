export default defineOAuthAuthentikEventHandler({
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, { user });
    const uri = new URL(`${process.env.BASE_URL}${event.node.req.url}`);
    const redirect = uri.searchParams.get('redirect');
    return sendRedirect(event, redirect || '/');
  },
  onError: (event, error) => {
    console.error('Auth error:', error);
  },
})
