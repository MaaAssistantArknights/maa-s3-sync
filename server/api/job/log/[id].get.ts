import fs from "fs"

import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  if (!/^[0-9]+$/.test(event.context.params!.id)) {
    throw createError({
      statusCode: 400,
      message: "Invalid job ID format. Please provide a valid numeric ID.",
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
      message: "Job not found or log file does not exist",
    })
  }

  return fs.createReadStream(job.logFile, {})
})
