import { Context } from './../lib/workflow/Context';

export async function dope({
  write,
  runForever,
  plugins: { prompt, skills },
}: Context) {
  const defineShould = (min: number) => {
    const operator = 1 + 1 / ((1 - min) / min);
    return (stat: number, mana: number) => {
      const inverse = (1 - stat) * operator;
      return Math.hypot(inverse, mana) > 1;
    };
  };

  const shouldHeal = defineShould(0.2);
  // const shouldRefresh = defineShould(0.2);

  prompt.onUpdate(
    async ({
      isFighting,
      hp: { percent: hp },
      mana: { percent: mana },
      // mv: { percent: mv },
    }) => {
      if (isFighting || mana === 0) {
        return;
      }

      if (hp < 1 && shouldHeal(hp, mana)) {
        if (await skills.has('curar leves')) {
          write('c "curar leves"');
          return;
        }
      }

      // else if (mv < 1 && shouldRefresh(mv, mana)) {
      //   write('c refrescar');
      // }
    },
  );

  await runForever();
}
