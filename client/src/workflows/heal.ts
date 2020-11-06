import { Context } from './../lib/workflow/Context';

export async function heal({
  write,
  runForever,
  plugins: { prompt },
}: Context) {
  const defineShouldHeal = (minHp: number) => {
    const operator = 1 + 1 / ((1 - minHp) / minHp);
    return (hp: number, mana: number) => {
      const inverse = (1 - hp) * operator;
      return inverse * inverse + mana * mana >= 1;
    };
  };

  const shouldHeal = defineShouldHeal(0.2);

  prompt.onUpdate(
    ({ isFighting, hp: { percent: hp }, mana: { percent: mana } }) => {
      if (isFighting) {
        return;
      }

      if (hp < 1 && mana > 0 && shouldHeal(hp, mana)) {
        write('c curar');
      }
    },
  );

  await runForever();
}
