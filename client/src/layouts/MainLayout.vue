<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Optional: Header -->
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Codestreamer
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Page content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// No specific script needed for a simple layout
</script>