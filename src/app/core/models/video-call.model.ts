import { CallEndReason, CallStatus } from "../enums/enums";

export interface ICallSessionPayload {
    callId: string;
    callerId: string;
    receiverId: string;
    callerSocketId: string;
    receiverSocketId: string | null;
    status: CallStatus;
    createdAt: string;
    expiresAt: string;
}

export interface IEndedEventPayload {
    callId: string;
    reason: CallEndReason;
}

export interface IRingingEventPayload {
    callId: string;
    callerId: string;
}

export interface IInitiatedEventPayload {
    callId: string;
    expiresAt: string;
}

export interface IAcceptedEventPayload {
    callId: string;
    calleeId: string;
    calleeType: 'customer' | 'provider';
}

export interface ISignalPayload {
    callId: string;
    type: 'offer' | 'answer' | 'ice-candidate' | 'media-error';
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}
