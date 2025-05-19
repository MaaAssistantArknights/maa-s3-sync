<template>
  <div class="flex flex-col flex-1 w-full max-w-4xl">
    <div class="flex justify-between px-4 py-3.5 border-b border-accented">
      <div class="space-x-4">
        <USelect v-model="channel" :items="channelOptions" label="Channel" placeholder="Channel" />
        <UInput v-model="version" label="Version" placeholder="Version" />
        <UInput v-model="triplet" label="Triplet" placeholder="Triplet" />
      </div>
      <UButton class="mr-4" @click="fetchData">Search</UButton>
    </div>
    <UTable :columns="columns" :data="data" :loading="loading" sticky :rowKey="'id'" />
    <div class="flex justify-end">
      <UPagination class="float-right" :page="page" :pageSize="pageSize" :total="total" :sibling-count="1"
        @update:page="onChangePage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { JobDetailSlideover, JobLogSlideover } from '#components';
import { statusBadgeColor } from '~/shared/constants/colors';

import type { TableColumn } from '@nuxt/ui';
import type { Version, Package, PackageSync, Job, VersionChannel } from '@prisma/client';
import type { Row } from '@tanstack/vue-table';

type DataType = Job & {
  sync: PackageSync & {
    package: Package & {
      version: Version;
    };
  };
}

type ResponseType = {
  data: DataType[]
  page: number
  limit: number
  totalPage: number
  total: number
}

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UBadge = resolveComponent('UBadge')
const NuxtTime = resolveComponent('NuxtTime')

const overlay = useOverlay()

// loading
const loading = ref(false)

// pagination
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

function onChangePage(newPage: number) {
  page.value = newPage
  fetchData()
}

// filter
const channel = ref<VersionChannel | undefined>()
const channelOptions: Array<{ label: string, value: VersionChannel }> = [
  { label: 'Stable', value: 'STABLE' },
  { label: 'Beta', value: 'BETA' },
  // { label: 'Alpha', value: 'ALPHA' },
]
const version = ref('')
const triplet = ref('')

// data
const data = ref<DataType[]>([])
async function fetchData() {
  loading.value = true
  try {
    const response = await $fetch<ResponseType>('/api/job', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        channel: channel.value,
        version: version.value,
        triplet: triplet.value,
      },
    })
    data.value = response.data || []
    page.value = response.page || 1
    total.value = response.total || 0
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

// table definition
const columns: TableColumn<DataType>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: (info) => `#${info.getValue()}`,
  },
  {
    accessorKey: 'sync.package.version.display',
    header: 'Version',
  },
  {
    accessorKey: 'sync.package.triplet',
    header: 'Triplet',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      return h(
        UBadge,
        { color: statusBadgeColor[status], variant: 'subtle', class: 'mr-2' },
        () => status
      )
    }
  },
  {
    accessorKey: 'updatedAt',
    header: 'Sync Time',
    cell: ({ getValue }) => {
      return h(NuxtTime, { dateStyle: 'long', timeStyle: 'medium', datetime: getValue() })
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown'
            })
        )
      )
    }
  }
]

function getRowItems(row: Row<DataType>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Show Job Details',
      onSelect() {
        const slideover = overlay.create(JobDetailSlideover, {
          props: {
            job: row.original
          }
        })
        slideover.open()
      }
    },
    {
      label: 'Show Job Log',
      onSelect() {
        const slideover = overlay.create(JobLogSlideover, {
          props: {
            job: row.original
          }
        })
        slideover.open()
      }
    },
  ]
}

// on mounted
onMounted(() => {
  fetchData()
})
</script>
