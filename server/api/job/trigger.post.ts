export default defineEventHandler(async (event) => {
  const { task_name } = { ...getQuery(event) };
  if (!task_name) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Task name is required' }))
  }
  runTask(task_name.toString())
  return { message: 'Task triggered' }
})
