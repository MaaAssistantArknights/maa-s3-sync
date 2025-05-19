import { VersionChannel } from "@prisma/client";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  // check version first
  if (query.version) {
    const version = await prisma.version.findFirst({
      where: {
        display: query.version.toString(),
      },
      include: {
        packages: {
          include: {
            sync: true,
          }
        }
      },
    });

    if (!version) {
      return createError({
        statusCode: 400,
        message: "Version not exists",
      });
    }

    return version;
  }

  // check channel, default to STABLE
  let channel: VersionChannel = VersionChannel.STABLE;

  // if channel is invalid, default to STABLE
  if (["STABLE", "BETA", "ALPHA"].includes(query.channel?.toString()?.toUpperCase() || "")) {
    channel = query.channel!.toString().toUpperCase() as VersionChannel;
  }

  const version = await prisma.version.findFirst({
    where: {
      channel,
    },
    orderBy: {
      releaseDate: "desc",
    },
    include: {
      packages: {
        include: {
          version: true,
          sync: {
            include: {
              jobs: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
            }
          },
        }
      }
    }
  });

  return version;
})
