import { ClientStorage } from '@amatiasq/client-storage';

const storage = new ClientStorage<string[]>('invalid-audio');
const invalid = new Set<string>(storage.get() || []);

export function playAudio(path: string) {
  if (invalid.has(path)) {
    return;
  }

  const audio = new Audio(path);
  console.debug('AUDIO', path);
  audio.volume = 0.05;
  audio.play();

  audio.onerror = () => {
    invalid.add(path);
    storage.set([...invalid]);
  };
}
