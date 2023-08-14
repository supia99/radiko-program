const readline = require("readline/promises");

export const readInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const readLineConsole = async ({
  input,
}: {
  input: string;
}): Promise<string> => {
  const rtnString = await readInterface.question(input);
  // readInterface.close();
  return rtnString;
};
