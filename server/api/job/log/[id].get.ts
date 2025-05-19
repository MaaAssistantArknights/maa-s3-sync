import fs from "fs"

import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  if (/^\d+$/.test(event.context.params!.id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID',
    })
  }
  const id = parseInt(event.context.params!.id)

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
  })

  if (!job || !job.logFile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Log file not found',
    })
  }

  return fs.createReadStream(job.logFile, {})
})
