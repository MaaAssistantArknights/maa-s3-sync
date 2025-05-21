import { HttpProxyAgent } from "~/server/utils/request_proxy"

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user, tokens }) {
    const { access_token } = tokens;
    const response = await $fetch<{
      role?: 'admin' | 'member'
      state?: 'active' | 'pending' | 'suspended'
    }>(
      `https://api.github.com/orgs/MaaAssistantArknights/memberships/${user.name}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        dispatcher: HttpProxyAgent,
      },
    )
    const { role, state } = response;
    if (state !== 'active') {
      return sendError(event, createError({
        statusCode: 403,
        message: 'You are not an active member of the MaaAssistantArknights organization.',
      }));
    }

    if (role !== 'admin') {
      return sendError(event, createError({
        statusCode: 403,
        message: 'You are not an admin of the MaaAssistantArknights organization.',
      }));
    }

    await setUserSession(event, { user });
    const uri = new URL(`${process.env.BASE_URL}${event.node.req.url}`);
    const redirect = uri.searchParams.get('redirect');
    return sendRedirect(event, redirect || '/');
  },
  onError: (event, error) => {
    console.error('Auth error:', error);
  }
})
