<template>
  <div>
    <div class="flex">
      <ULink href="/" aria-label="Home">
        <img src="/images/icon.png" class="h-10 w-auto" />
      </ULink>
      <h1 class="ml-4 text-2xl font-bold">MAA Sync Dashboard</h1>
    </div>
    <h2 class="mt-12 text-lg font-semibold">
      Sign in to dashboard
    </h2>
    <p class="mt-2 text-sm">
      Make sure you are administrator of the MAA Team.
    </p>
    <div class="my-4">
      <UButton class="w-full justify-center" icon="grommet-icons:github" :to="`${origin}/api/auth/github`">
        Sign in with GitHub
      </UButton>
    </div>
    <USeparator color="secondary" label="or" />
    <div class="mt-4">
      <UButton class="w-full justify-center" icon="fluent:person-arrow-right-24-filled" :to="`${origin}/api/auth/authentik`">
        Sign in with MAA Account
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'slim',
})

const { loggedIn } = useUserSession()
const { origin } = useRequestURL()

if (loggedIn.value) {
  navigateTo('/')
}

</script>
