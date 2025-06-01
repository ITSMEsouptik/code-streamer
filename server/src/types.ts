// server/src/types.ts

import { UserRole } from "./types/userRole";

export interface Participant {
    id: string; // socket.id
    role: UserRole;
}

export interface Room {
    id: string; // Session ID (same as roomId for Socket.IO rooms)
    participants: Participant[];
    // Future: problemId, language, etc.
}

// You can add more shared types here as needed
export interface SessionError {
    message: string;
}

export interface SessionSuccessPayload {
    sessionId: string;
    role: UserRole;
    roomId: string; // Often same as sessionId
}

export interface ParticipantNotificationPayload {
    participantId: string;
    role: UserRole;
}