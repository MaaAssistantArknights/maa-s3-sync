export default defineEventHandler(async (event) => {
  let triggeredBy = '*Unknown*'

  const { user } = await getUserSession(event)
  if (user) {
    // @ts-ignore
    triggeredBy = `${user.name}`
  }

  const { headers } = event.node.req
  const authHeader = headers['authorization'] || headers['Authorization'] as string
  if (authHeader) {
    triggeredBy = `*Token*`
  }

  const { task_name } = { ...getQuery(event) };
  if (!task_name) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Task name is required' }))
  }
  runTask(task_name.toString(), { payload: { trigger: triggeredBy } })
  return { message: 'Task triggered' }
})
