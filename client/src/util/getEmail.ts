import { ClientStorage } from '@amatiasq/client-storage';

export function getEmail(user: string) {
  const storage = new ClientStorage<string>(`email:${user}`);
  const stored = storage.get();

  if (stored) {
    return stored;
  }

  const input = prompt(`Email for ${user}?`);

  if (!input) {
    throw new Error(`Email is required to create a user`);
  }

  storage.set(input);
  return input;
}
