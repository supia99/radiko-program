import * as fs from "node:fs";
import { exchangeToRadikoJson } from "./exchangeToRadikoJson";
import { Prog } from "./type/Radiko";
const STATION_ID = "TBS"
const PFM_NAME = "伊集院光"

const main = () => {
  try {
    // https://radiko.jp/v3/program/date/20230814/JP13.xml
    const file = fs.readFileSync("tmp/tmp.xml", "utf8");
    const xml = exchangeToRadikoJson(file);
    console.log(
      createRecCommand({
        stationId: STATION_ID,
        prog: searchPfm({
          targetPfm: PFM_NAME,
          progs: xml.radiko.stations.station[0].progs.prog,
        })[0],
      })
    );

  } catch (e) {
    console.log(e);
    throw e;
  }
};

// sudo ./mainRec.sh TBS 202209191300 153 赤江珠緒たまむすび
const createRecCommand = ({
  stationId,
  prog,
}: {
  stationId: string;
  prog: Prog;
}): string => {
  const commandPrefix = "sudo ./mainRec.sh";
  return `${commandPrefix} ${stationId} ${prog.$.ft} ${prog.$.dur} ${prog.title}`;
};

const searchPfm = ({
  targetPfm,
  progs,
}: {
  targetPfm: string;
  progs: Prog[];
}): Prog[] => {
  const rtnProgs: Prog[] = [];
  // 実際にはprogsはarrayでないため、filterは使えない
  for (const [_key, prog] of Object.entries(progs)) {
    prog.pfm.includes(targetPfm) && rtnProgs.push(prog);
  }
  return rtnProgs;
};
main();
