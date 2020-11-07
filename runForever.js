(async function train() {
  await mud
    .getPlugin("prompt")
    .until((stats) =>
      stats.hp.percent === 1 &&
      stats.mana.percent === 1 &&
      stats.mv.percent === 1
    );

  console.log('Stats 100%. Start train...');

  try {
    await mud.invokeWorkflow("train");
    console.log("workflow completed");
  } catch (error) {
    console.log("workflow failed");
  }

  train();
})();
