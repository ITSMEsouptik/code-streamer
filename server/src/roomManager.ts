import { v4 as uuidv4 } from 'uuid';
import { Room, Participant, SessionError } from './types';
import { UserRoleEnum } from './enums/userRoleEnum';

// In-memory store for rooms: Map<sessionId, RoomData>
const rooms = new Map<string, Room>();

export const createRoom = (creatorSocketId: string): { room: Room, error?: SessionError } => {
    const sessionId = uuidv4().substring(0, 8);
    const newRoom: Room = {
        id: sessionId,
        participants: [{ id: creatorSocketId, role: UserRoleEnum.Interviewer }],
    };
    rooms.set(sessionId, newRoom);
    console.log(`ROOM_MANAGER: Room ${sessionId} created by ${creatorSocketId}. Total rooms: ${rooms.size}`);
    return { room: newRoom };
};

export const joinRoom = (sessionId: string, joinerSocketId: string): { room?: Room, newParticipantRole?: UserRoleEnum.Interviewee, error?: SessionError } => {
    const room = rooms.get(sessionId);

    if (!room) {
        return { error: { message: 'Session not found.' } };
    }

    if (room.participants.find(p => p.id === joinerSocketId)) {
        console.log(`ROOM_MANAGER: User ${joinerSocketId} is already in session ${sessionId}.`);
        // Optionally return the room if they are already in, or an error/specific status
        return { room, error: { message: 'You are already in this session.'} }; // Or return { room }
    }
    
    const isIntervieweeSlotTaken = room.participants.some(p => p.role === UserRoleEnum.Interviewee);

    if (room.participants.length >= 2 || isIntervieweeSlotTaken) {
        return { error: { message: 'Session is full or interviewee slot taken.' } };
    }

    room.participants.push({ id: joinerSocketId, role: UserRoleEnum.Interviewee });
    console.log(`ROOM_MANAGER: User ${joinerSocketId} joined room ${sessionId} as interviewee. Participants: ${room.participants.length}`);
    return { room, newParticipantRole: UserRoleEnum.Interviewee };
};

export const leaveRoom = (socketId: string): { leftRoomId?: string, removedParticipant?: Participant, remainingParticipants?: Participant[] } => {
    let result: { leftRoomId?: string, removedParticipant?: Participant, remainingParticipants?: Participant[] } = {};

    rooms.forEach((room, sessionId) => {
        const participantIndex = room.participants.findIndex(p => p.id === socketId);
        if (participantIndex !== -1) {
            const removedParticipant = room.participants.splice(participantIndex, 1)[0];
            result = {
                leftRoomId: sessionId,
                removedParticipant,
                remainingParticipants: [...room.participants] // Return a copy
            };

            console.log(`ROOM_MANAGER: User ${socketId} (role: ${removedParticipant.role}) removed from room ${sessionId}. Remaining: ${room.participants.length}`);

            if (room.participants.length === 0) {
                rooms.delete(sessionId);
                console.log(`ROOM_MANAGER: Room ${sessionId} is now empty and deleted. Total rooms: ${rooms.size}`);
            }
            return; // Exit forEach for this room, assuming user is in one room only
        }
    });
    return result;
};

export const getRoomById = (sessionId: string): Room | undefined => {
    return rooms.get(sessionId);
};

export const getAllRooms = (): Map<string, Room> => { // For debugging or admin purposes
    return rooms;
};