import { MappedMsgFacade } from 'msg-facade';

export type SpawnedWorker<T> = MappedMsgFacade<T> & { exit: Promise<number>; terminate: () => Promise<number> };
