import type { paths } from '~/types/generated/api';

type ApiSuccessData<T> = T extends { success: true; data: infer Data }
    ? Data
    : never;

type EventCreateResponse =
    paths['/events']['post']['responses'][201]['content']['application/json'];
type EventGetResponse =
    paths['/events/{id}']['get']['responses'][200]['content']['application/json'];
type EventPatchResponse =
    paths['/events/{id}']['patch']['responses'][200]['content']['application/json'];

export type InstructorEventCreateApiData = ApiSuccessData<EventCreateResponse>;
export type InstructorEventGetApiData = ApiSuccessData<EventGetResponse>;
export type InstructorEventPatchApiData = ApiSuccessData<EventPatchResponse>;
