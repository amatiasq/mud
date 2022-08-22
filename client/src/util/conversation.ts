import { BasicContext } from '../lib/context/BasicContextCreator';

export function conversation(
  when: BasicContext['when'],
  write: BasicContext['write'],
) {
  return async (questions: Record<string, string>) => {
    for (const [question, answer] of Object.entries(questions)) {
      await when(question);
      write(answer);
    }
  };
}
