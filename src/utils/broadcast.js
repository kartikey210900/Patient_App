
export const channel = new BroadcastChannel('patient-db-sync');

export function broadcastDbUpdate() {
  channel.postMessage({ type: 'DB_UPDATED' });
}

export function onDbUpdate(callback) {
  channel.onmessage = (event) => {
    if (event.data?.type === 'DB_UPDATED') {
      callback();
    }
  };
}
