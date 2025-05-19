import { VersionChannel } from "@prisma/client";
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const { channel, version, triplet, page, limit } = { ...getQuery(event) };

  const _limit =Math.min(limit ? parseInt(limit as string) : 10, 100);
  const _page = page ? parseInt(page as string) : 1;
  const _skip = (_page - 1) * _limit;
  const _take = _limit;

  const data = await prisma.job.findMany({
    where: {
      sync: {
        package: {
          version: {
            display: {
              contains: version ? version.toString() : undefined,
            },
            channel: Object.keys(VersionChannel).includes(channel?.toString() || '') ? channel?.toString() as VersionChannel : undefined,
          },
          triplet: {
            contains: triplet ? triplet.toString() : undefined,
          },
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip: _skip,
    take: _take,
    include: {
      sync: {
        include: {
          package: {
            include: {
              version: true,
            }
          }
        }
      }
    }
  })

  const count = await prisma.job.count({
    where: {
      sync: {
        package: {
          version: {
            display: version ? version.toString() : undefined,
            channel: Object.keys(VersionChannel).includes(channel?.toString() || '') ? channel?.toString() as VersionChannel : undefined,
          },
          triplet: triplet ? triplet.toString() : undefined,
        }
      }
    },
  })
  const totalPage = Math.ceil(count / _limit);

  return {
    data,
    page: _page,
    limit: _limit,
    totalPage,
    total: count,
  }
})
