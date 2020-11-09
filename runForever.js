(async function train() {
  // bank
  await mud.runWorkflow('bank', async ({ write, plugins: { navigation } }) => {
    await navigation.execute('r4s2en');
    write('banco ingresar todo');
    write('banco retirar 2000');
    await navigation.execute('s2w4n');
  });

  const mirar = setInterval(() => mud.telnet.send('b'), 80 * 1000)

  await mud
    .getPlugin("prompt")
    .until((stats) =>
      stats.hp.percent > 9 &&
      stats.mana.percent > 9 &&
      stats.mv.percent > 9
    );

  clearInterval(mirar);
  console.log('Stats 100%. Start train...');

  try {
    await mud.invokeWorkflow("train");
    console.log("workflow completed");
  } catch (error) {
    console.log("workflow failed");
  }

  train();
})();


[
  'armadura',
  'bendecir',
  'detectar escondido',
  'detectar invisible',
  'detectar magia',
  'invisibilidad',
  'volar'
].forEach(x =>
  mud.telnet.send(`conjurar '${x}'`)
)