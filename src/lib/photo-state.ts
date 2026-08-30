export type PhotoStatus = 'empty' | 'loading' | 'loaded' | 'failed';

export type PhotoState = {
  src: string | undefined;
  status: PhotoStatus;
};

export function createPhotoState(src: string | undefined): PhotoState {
  return { src, status: src ? 'loading' : 'empty' };
}

export function resetPhotoState(state: PhotoState, src: string | undefined): PhotoState {
  return state.src === src ? state : createPhotoState(src);
}

export function resolvePhotoStatus(state: PhotoState, src: string | undefined): PhotoStatus {
  return state.src === src ? state.status : src ? 'loading' : 'empty';
}
