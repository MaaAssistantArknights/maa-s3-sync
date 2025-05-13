<template>
  <div>
    <NuxtRouteAnnouncer />
    <div v-if="loggedIn">
      <h1>Welcome {{ user.name }}!</h1>
      <button @click="clear">Logout</button>
    </div>
    <div v-else>
      <h1>Not logged in</h1>
      <a href="/api/auth/authentik">Login with Authentik</a>
      <!-- or open the OAuth route in a popup -->
      <button @click="openInPopup('/api/auth/authentik')">Login with Authentik</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession()
</script>
