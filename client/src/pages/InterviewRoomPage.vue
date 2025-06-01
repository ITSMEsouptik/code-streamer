<template>
  <q-page padding class="interview-room-page">
    <div class="q-mb-md">
      <div class="text-h5">Codestreamer Interview Room (Quasar)</div>
      <p>Your Socket ID: {{ socketId || "Connecting..." }}</p>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-xs-12 col-sm-6">
        <VideoPlaceholder title="My Video" />
      </div>
      <div class="col-xs-12 col-sm-6">
        <VideoPlaceholder title="Participant's Video" />
      </div>
    </div>

    <EditorPlaceholder class="q-mb-md" />

    <div class="message-sender row items-center q-gutter-sm">
      <q-input
        filled
        dense
        v-model="message"
        label="Send a test message"
        class="col"
        @keyup.enter="handleSendMessage"
      />
      <q-btn color="primary" label="Send" @click="handleSendMessage" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Socket } from 'socket.io-client';
import EditorPlaceholder from 'components/EditorPlaceholder.vue';
import VideoPlaceholder from 'components/VideoPlaceholder.vue';
import { connectSocket, sendClientMessage, getSocket } from '../service/socket';

const message = ref('');
const socketId = ref<string | null>(null);
let skt: Socket | null = null;

onMounted(() => {
  skt = connectSocket();
  if (skt) {
    skt.on('connect', () => {
      socketId.value = skt?.id || null;
    });
  }
});

onUnmounted(() => {
  // Optional: skt?.disconnect();
});

const handleSendMessage = () => {
  if (message.value.trim() && skt) {
    sendClientMessage(message.value);
    message.value = '';
  }
};
</script>

<style scoped>
.interview-room-page {
  /* Add any page-specific styles here */
}
</style>