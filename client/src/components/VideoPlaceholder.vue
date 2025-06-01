<template>
  <q-card flat bordered class="video-placeholder q-pa-sm">
    <q-card-section>
      <div class="text-subtitle1">{{ title }}</div>
    </q-card-section>
    <!-- Actual video elements will go here -->
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  title: string;
}
const props = defineProps<Props>();
</script>

<style scoped>
.video-placeholder {
  min-height: 150px;
  min-width: 200px; /* Adjust as needed */
  background-color: #e0e0e0; /* Or use Quasar color palette */
}
</style>