<template>
  <div class="flex flex-col flex-1 w-full max-w-4xl">
    <div class="flex justify-around px-4 py-3.5 border-b border-accented">
      <div class="mr-4">
        <USelect v-model="channel" :items="channelOptions" label="Channel" />
      </div>
      <div class="mr-4">
        <UInput v-model="version" label="Version" placeholder="Version" />
      </div>
      <div class="mr-4">
        <UInput v-model="triplet" label="Triplet" placeholder="Triplet" />
      </div>
      <UButton class="mr-4" @click="fetchData">Search</UButton>
      <UPagination :page="page" :pageSize="pageSize" :total="total" :sibling-count="1" @update:page="onChangePage" />
    </div>
    <UTable :columns="columns" :data="data" :loading="loading" sticky :rowKey="'id'" @rowClick="onRowClick" />
  </div>
</template>

<script lang="ts" setup>
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
const channel = ref<VersionChannel>('STABLE')
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
  },
  {
    accessorKey: 'updatedAt',
    header: 'Sync Time',
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
      label: 'Copy payment ID',
      onSelect() {
        // navigator.clipboard.writeText(row.original.id)

        // toast.add({
        //   title: 'Payment ID copied to clipboard!',
        //   color: 'success',
        //   icon: 'i-lucide-circle-check'
        // })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'View customer'
    },
    {
      label: 'View payment details'
    }
  ]
}

// interaction
function onRowClick(row: DataType) {
  // Handle row click
}

// on mounted
onMounted(() => {
  fetchData()
})
</script>

<style></style>
