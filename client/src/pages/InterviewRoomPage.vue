<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { Socket } from 'socket.io-client';
import EditorPlaceholder from 'components/EditorPlaceholder.vue'; // Ensure correct path
import VideoPlaceholder from 'components/VideoPlaceholder.vue'; // Ensure correct path
import { connectSocket, emitCreateSession, emitJoinSession, getSocket } from '../service/socket'; // Ensure correct path
import type { UserRole } from '../types/UserRole';
import type { UserRoleEnum } from '../enums/UserRole';

// --- Reactive State Variables ---
const socketId = ref<string | null>(null); // From Sprint 0, for displaying connected socket ID
const currentSessionId = ref<string | null>(null);
const userRole = ref<UserRole | null>(null);
const otherParticipant = ref<{ participantId: string; role: string } | null>(null);

const message = ref(''); // For the test message sender

const joinSessionIdInput = ref<string>('');
const sessionError = ref<string | null>(null);

let skt: Socket | null = null;

const isInSession = computed(() => !!currentSessionId.value);

// --- Lifecycle Hooks ---
onMounted(() => {
  skt = connectSocket(); // Establish connection
  if (skt) {
    socketId.value = skt.id || null; // Initial ID if already connected

    skt.on('connect', () => {
      socketId.value = skt?.id || null;
      console.log('CLIENT: Socket re-connected with ID:', socketId.value);
    });

    skt.on(
      'session-created',
      (data: { sessionId: string; role: UserRoleEnum.Interviewer; roomId: string }) => {
        currentSessionId.value = data.sessionId;
        userRole.value = data.role;
        sessionError.value = null;
        console.log('CLIENT: Session Created:', data);
      },
    );

    skt.on(
      'session-joined',
      (data: { sessionId: string; role: UserRoleEnum.Interviewee; roomId: string }) => {
        currentSessionId.value = data.sessionId;
        userRole.value = data.role;
        sessionError.value = null;
        console.log('CLIENT: Session Joined:', data);
      },
    );

    skt.on('session-error', (data: { message: string }) => {
      sessionError.value = data.message;
      console.error('CLIENT: Session Error:', data.message);
    });

    skt.on('participant-joined', (data: { participantId: string; role: string }) => {
      console.log('CLIENT: Participant joined:', data);
      otherParticipant.value = data;
    });

    skt.on('participant-left', (data: { participantId: string; role: string }) => {
      console.log('CLIENT: Participant left:', data);
      if (otherParticipant.value?.participantId === data.participantId) {
        otherParticipant.value = null;
      }
    });

    // From Sprint 0 - can be adapted or removed if not used
    skt.on('server-message', (data) => {
      console.log('CLIENT: Message from server (test):', data);
    });
  }
});

onUnmounted(() => {
  // Clean up listeners if skt exists and is connected
  // skt?.off('connect');
  // skt?.off('session-created');
  // ... and so on for all listeners
  // skt?.disconnect(); // Or manage disconnection explicitly if needed
});

// --- Methods ---
const createSession = () => {
  if (skt) {
    sessionError.value = null;
    emitCreateSession();
  } else {
    sessionError.value = 'Socket not connected. Cannot create session.';
  }
};

const joinSession = () => {
  if (skt && joinSessionIdInput.value.trim()) {
    sessionError.value = null;
    emitJoinSession(joinSessionIdInput.value.trim());
  } else if (!skt) {
    sessionError.value = 'Socket not connected. Cannot join session.';
  } else {
    sessionError.value = 'Please enter a Session ID to join.';
  }
};

// Test message sender (if you keep it)
const handleSendMessage = () => {
  if (message.value.trim() && skt) {
    getSocket().emit('client-message', message.value);
    message.value = '';
  }
};
</script>

<template>
  <q-page padding class="interview-room-page">
    <div class="q-mb-md text-center">
      <!-- Centering title elements -->
      <div class="text-h4 q-mb-sm">Codestreamer</div>
      <div v-if="!isInSession" class="text-subtitle1">
        Create a new session or join an existing one to start.
      </div>
    </div>

    <!-- Connection & Session Info Display -->
    <div class="q-mb-md status-info" v-if="socketId || currentSessionId">
      <q-chip
        dense
        square
        icon="rss_feed"
        :color="socketId ? 'positive' : 'negative'"
        text-color="white"
      >
        {{ socketId ? 'Connected' : 'Disconnected' }}
        <span v-if="socketId"> (ID: {{ socketId.substring(0, 6) }}...)</span>
      </q-chip>
      <q-chip
        v-if="currentSessionId"
        dense
        square
        icon="meeting_room"
        color="info"
        text-color="white"
      >
        Session: {{ currentSessionId }}
      </q-chip>
      <q-chip
        v-if="userRole"
        dense
        square
        :icon="userRole === 'interviewer' ? 'manage_accounts' : 'person'"
        color="accent"
        text-color="white"
      >
        Role: {{ userRole }}
      </q-chip>
      <q-chip
        v-if="otherParticipant"
        dense
        square
        icon="groups"
        color="secondary"
        text-color="white"
      >
        {{ otherParticipant.role === 'interviewee' ? 'Interviewee' : 'Interviewer' }} Joined
      </q-chip>
    </div>

    <!-- Error Banner -->
    <q-banner v-if="sessionError" rounded inline-actions class="text-white bg-red q-mb-md">
      <template v-slot:avatar>
        <q-icon name="error_outline" />
      </template>
      {{ sessionError }}
      <template v-slot:action>
        <q-btn flat dense color="white" label="Dismiss" @click="sessionError = null" />
      </template>
    </q-banner>

    <!-- ===>>> UI FOR SESSION CREATION/JOINING (Visible when NOT in a session) <<<=== -->
    <div v-if="!isInSession" class="session-controls q-pa-md shadow-2 rounded-borders">
      <div class="row q-col-gutter-lg items-stretch">
        <!-- Create Session Card/Section -->
        <div class="col-xs-12 col-md-6">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-h6">Start a New Session</div>
              <div class="text-caption">Become the interviewer and invite someone.</div>
            </q-card-section>
            <q-card-actions align="center" class="q-pa-md">
              <q-btn
                color="primary"
                icon="add_circle_outline"
                label="Create New Session"
                @click="createSession"
                :loading="!socketId"
                :disable="!socketId"
                class="full-width"
                size="lg"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Join Session Card/Section -->
        <div class="col-xs-12 col-md-6">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-h6">Join an Existing Session</div>
              <div class="text-caption">Enter the Session ID provided by the interviewer.</div>
            </q-card-section>
            <q-card-section>
              <q-input
                filled
                v-model="joinSessionIdInput"
                label="Enter Session ID"
                :disable="!socketId"
                clearable
                @keyup.enter="joinSession"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
              </q-input>
            </q-card-section>
            <q-card-actions align="center" class="q-pa-md">
              <q-btn
                color="secondary"
                icon="login"
                label="Join Session"
                @click="joinSession"
                :disable="!socketId || !joinSessionIdInput.trim()"
                class="full-width"
                size="lg"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
    <!-- ===>>> END OF SESSION CREATION/JOINING UI <<<=== -->

    <!-- Interview Area: Show if IN a session -->
    <div v-if="isInSession" class="interview-area q-mt-lg">
      <q-separator spaced />
      <div class="text-h6 q-my-md">
        Interview in Progress
        <span
          v-if="userRole === 'interviewer' && !otherParticipant"
          class="text-caption text-orange q-ml-sm"
          >(Waiting for interviewee...)</span
        >
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-xs-12 col-sm-6">
          <VideoPlaceholder title="My Video Feed" />
        </div>
        <div class="col-xs-12 col-sm-6">
          <VideoPlaceholder
            :title="
              otherParticipant
                ? otherParticipant.role === 'interviewee'
                  ? 'Interviewee\'s Video'
                  : 'Interviewer\'s Video'
                : 'Participant 2 Video'
            "
          />
        </div>
      </div>

      <EditorPlaceholder class="q-mb-md" />

      <!-- Test message sender (can be removed later or integrated differently) -->
      <div class="message-sender row items-center q-gutter-sm q-mt-md">
        <q-input
          filled
          dense
          v-model="message"
          label="Send a test message to room"
          class="col"
          @keyup.enter="handleSendMessage"
        />
        <q-btn dense color="grey-7" icon="send" @click="handleSendMessage" />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.interview-room-page {
  max-width: 1000px; /* Or your preferred max width */
  margin: 0 auto;
}

.status-info .q-chip {
  margin-right: 8px;
  margin-bottom: 8px;
}

.session-controls .q-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.full-height {
  height: 100%;
}
</style>
