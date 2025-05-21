<template>
  <div>
    <div class="flex">
      <ULink href="/" aria-label="Home">
        <img src="/images/icon.png" class="h-10 w-auto" />
      </ULink>
      <h1 class="ml-4 text-2xl font-bold">{{ $t('Pages.Login.title') }}</h1>
    </div>
    <h2 class="mt-12 text-lg font-semibold">
      {{ $t('Pages.Login.description') }}
    </h2>
    <p class="mt-2 text-sm">
      {{ $t('Pages.Login.tip') }}
    </p>
    <div class="my-4">
      <UButton class="w-full justify-center" icon="grommet-icons:github" :to="`${origin}/api/auth/github`">
        {{ $t('Pages.Login.github') }}
      </UButton>
    </div>
    <USeparator color="secondary" label="or" />
    <div class="mt-4">
      <UButton class="w-full justify-center" icon="fluent:person-arrow-right-24-filled" :to="`${origin}/api/auth/authentik`">
        {{ $t('Pages.Login.account') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'MAA Sync Status - Login',
})

definePageMeta({
  layout: 'slim',
})

const { loggedIn } = useUserSession()
const { origin } = useRequestURL()

if (loggedIn.value) {
  navigateTo('/')
}

</script>
