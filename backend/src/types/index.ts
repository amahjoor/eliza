import * as express from 'express'

export interface TypedRequest<T = any, Q = any> extends express.Request {
  body: T;
  query: Q;
  params: any;
}

export interface TypedResponse<T = any> extends express.Response {
  json(data: T): TypedResponse<T>;
}

export interface MeetingRequestBody {
  name: string;
  startTime?: Date;
  endTime?: Date;
  recordingType: string;
  status?: string;
  userId: number;
  projectId?: number | null;
  attendeeIds?: number[];
}

export interface MeetingUpdateBody {
  name?: string;
  endTime?: Date;
  status?: string;
  projectId?: number | null;
  attendeeIds?: number[];
}

export interface MeetingQueryParams {
  userId?: string;
  projectId?: string;
  limit?: string;
  offset?: string;
}

export interface GenerateNotesBody {
  templateId?: number;
}
