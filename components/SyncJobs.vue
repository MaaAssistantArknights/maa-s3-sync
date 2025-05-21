<template>
  <div class="flex flex-col flex-1 w-full max-w-4xl">
    <div class="flex justify-between px-4 py-3.5 border-b border-accented">
      <div class="space-x-4">
        <USelect v-model="channel" :items="channelOptions" :label="$t('Common.channel')" :placeholder="$t('Common.channel')" />
        <UInput v-model="version" :label="$t('Common.version')" :placeholder="$t('Common.version')" />
        <UInput v-model="triplet" :label="$t('Common.triplet')" :placeholder="$t('Common.triplet')" />
      </div>
      <UButton class="mr-4" @click="fetchData">{{$t('Common.search')}}</UButton>
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
import useCurrentLocale from '~/utils/useCurrentLocale';

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
const StatusBadge = resolveComponent('StatusBadge')
const NuxtTime = resolveComponent('NuxtTime')

const overlay = useOverlay()
const { t: $t } = useI18n()
const locale = useCurrentLocale()

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
  { label: $t('Common.Version.stable'), value: 'STABLE' },
  { label: $t('Common.Version.beta'), value: 'BETA' },
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
    header: $t('Common.version'),
  },
  {
    accessorKey: 'sync.package.triplet',
    header: $t('Common.triplet'),
  },
  {
    accessorKey: 'status',
    header: $t('Common.status'),
    cell: ({ getValue }) => {
      const status = getValue() as string
      return h(
        StatusBadge,
        { status },
        () => status
      )
    }
  },
  {
    accessorKey: 'updatedAt',
    header: $t('Components.SyncJobs.sync_time'),
    cell: ({ getValue }) => {
      return h(NuxtTime, { 
        dateStyle: 'long', 
        timeStyle: 'medium', 
        datetime: getValue(), 
        locale: locale.iso as string
      })
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
      label: $t('Common.actions'),
    },
    {
      label: $t('Components.SyncJobs.show_job_detail'),
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
      label: $t('Components.SyncJobs.show_job_log'),
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
