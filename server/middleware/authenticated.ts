import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { authorizedRoutes } = useRuntimeConfig()

  if (authorizedRoutes && authorizedRoutes.includes(`${event.node.req.method} ${event.node.req.url}`)) {

    // Secret Key Authentication
    const { headers } = event.node.req
    const authHeader = headers['authorization'] || headers['Authorization'] as string
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      if (token) {
        const secretKey = await prisma.secretKey.findFirst({
          where: {
            key: token,
            OR: [
              {
                expiresAt: {
                  gte: new Date(),
                },
              },
              {
                expiresAt: null,
              }
            ]
          }
        })
        if (!secretKey) {
          return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))
        }
      }
    }

    // User Authentication
    const { user } = await getUserSession(event)
    if (!user) {
      return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))
    }
  }
})
