// server/src/socketHandlers.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import * as RoomManager from './roomManager';
import { SessionSuccessPayload, ParticipantNotificationPayload } from './types';
import { UserRoleEnum } from './enums/userRoleEnum';

export const registerSocketHandlers = (io: SocketIOServer, socket: Socket) => {
    console.log(`SOCKET_HANDLER: Registering handlers for socket ${socket.id}`);

    socket.on('create-session', () => {
        console.log(`SOCKET_HANDLER: 'create-session' from ${socket.id}`);
        const { room, error } = RoomManager.createRoom(socket.id);

        if (error || !room) {
            // This case should ideally not happen with createRoom as designed
            socket.emit('session-error', { message: error?.message || 'Failed to create session.' });
            return;
        }
        
        socket.join(room.id); // Socket.IO room join
        const payload: SessionSuccessPayload = {
            sessionId: room.id,
            role: UserRoleEnum.Interviewer, 
            roomId: room.id,
        };
        socket.emit('session-created', payload);
        console.log(`SOCKET_HANDLER: Emitted 'session-created' to ${socket.id} for room ${room.id}`);
    });

    socket.on('join-session', (data: { sessionId: string }) => {
        const { sessionId } = data;
        console.log(`SOCKET_HANDLER: 'join-session' to room ${sessionId} from ${socket.id}`);
        const { room, newParticipantRole, error } = RoomManager.joinRoom(sessionId, socket.id);

        if (error || !room || !newParticipantRole) {
            socket.emit('session-error', { message: error?.message || 'Failed to join session.' });
            return;
        }

        socket.join(room.id); // Socket.IO room join
        const joinerPayload: SessionSuccessPayload = {
            sessionId: room.id,
            role: newParticipantRole,
            roomId: room.id,
        };
        socket.emit('session-joined', joinerPayload);
        console.log(`SOCKET_HANDLER: Emitted 'session-joined' to ${socket.id} for room ${room.id}`);

        // Notify existing interviewer
        const interviewer = room.participants.find(p => p.role === UserRoleEnum.Interviewer  && p.id !== socket.id);
        if (interviewer) {
            const notificationPayload: ParticipantNotificationPayload = {
                participantId: socket.id,
                role: newParticipantRole,
            };
            io.to(interviewer.id).emit('participant-joined', notificationPayload);
            console.log(`SOCKET_HANDLER: Notified interviewer ${interviewer.id} about new participant ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`SOCKET_HANDLER: 'disconnect' from ${socket.id}`);
        const { leftRoomId, removedParticipant, remainingParticipants } = RoomManager.leaveRoom(socket.id);

        if (leftRoomId && removedParticipant && remainingParticipants) {
            socket.leave(leftRoomId); // Ensure socket leaves the Socket.IO room as well

            if (remainingParticipants.length > 0) {
                const notificationPayload: ParticipantNotificationPayload = {
                    participantId: socket.id,
                    role: removedParticipant.role,
                };
                // Notify all remaining participants in that room
                remainingParticipants.forEach(p => {
                    io.to(p.id).emit('participant-left', notificationPayload);
                });
                 console.log(`SOCKET_HANDLER: Notified ${remainingParticipants.length} participant(s) in room ${leftRoomId} that ${socket.id} left.`);
            }
        }
    });

    // Example client message handler (can be expanded)
    socket.on('client-message', (data: { message: string, roomId?: string }) => {
        console.log(`SOCKET_HANDLER: 'client-message' from ${socket.id}: "${data.message}" for room ${data.roomId || 'N/A'}`);
        // Determine target room for broadcasting if applicable
        const targetRoomId = data.roomId || Array.from(socket.rooms).find(r => r !== socket.id);
        if (targetRoomId) {
            // Example: Broadcast to the room, excluding sender if needed
            // socket.to(targetRoomId).emit('server-message', `Message from ${socket.id.substring(0,4)}: ${data.message}`);
            io.to(targetRoomId).emit('server-message', {
                senderId: socket.id,
                message: data.message,
                timestamp: new Date().toISOString()
            });
        } else {
            socket.emit('server-message', {
                message: `Server received your message: "${data.message}", but no target room found.`,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Add more specific event handlers here as your application grows
    // e.g., 'code-change', 'webrtc-signal', etc.
};