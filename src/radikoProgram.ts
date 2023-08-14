import * as fs from "node:fs";
import { exchangeToRadikoJson } from "./exchangeToRadikoJson";
import { Prog, Station } from "./type/Radiko";
import { readInterface, readLineConsole } from "./readlineConsole";

const main = async () => {
  try {
    // https://radiko.jp/v3/program/date/20230814/JP13.xml
    const file = fs.readFileSync("tmp/tmp.xml", "utf8");
    const xml = exchangeToRadikoJson(file);
    const stations = getStationNames({ stations: xml.radiko.stations.station });
    console.log(stations);
    const targetStationName = await readLineConsole({
      input: "station名を入力してください＞",
    });

    const station = searchStation({
      targetStationName,
      stations: xml.radiko.stations.station,
    });
    console.log(station);
    console.log(
      createRecCommand({
        stationId: station.$.id,
        prog: await selectProg({ progs: station.progs.prog }),
        // searchPfm({
        //   targetPfm: PFM_NAME,
        //   progs: station.progs.prog,
        // })[0],
      })
    );
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    readInterface.close();
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
  console.log(prog);
  const commandPrefix = "sudo ./mainRec.sh";
  // TODO: titleをescapeする
  return `${commandPrefix} ${stationId} ${prog.$.ft.substring(
    0,
    prog.$.ft.length - 2
  )} ${prog.$.dur.substring(0, prog.$.dur.length - 2)} ${prog.title}`;
};

// 出演者名で検索をかける
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

const selectProg = async ({ progs }: { progs: Prog[] }): Promise<Prog> => {
  for (const [key, prog] of Object.entries(progs)) {
    console.log(`${key}：${prog.title}`);
  }
  const targetProgTitle = await readLineConsole({
    input: "titleを入力してください＞",
  });

  let targetProgs: Prog[] = [];
  for (const [_key, prog] of Object.entries(progs)) {
    if (prog.title.includes(targetProgTitle)) {
      targetProgs.push(prog);
    }
  }
  if (targetProgs.length === 1) {
    return targetProgs[0];
  } else if (targetProgs.length === 0) {
    throw new Error("番組を選べませんでした。");
  }

  const rtnProg = {
    $: {
      ft: targetProgs[0].$.ft,
      to: targetProgs[targetProgs.length - 1].$.to,
      dur: calcDur({
        start: targetProgs[0].$.ft,
        end: targetProgs[targetProgs.length - 1].$.to,
      }),
    },
    title: targetProgs[0].title,
    pfm: targetProgs[0].pfm,
    info: targetProgs[0].info,
  };
  return rtnProg;
};

// station名の配列を取得する
const getStationNames = ({ stations }: { stations: Station[] }) => {
  const stationNames: string[] = [];
  for (const [_key, station] of Object.entries(stations)) {
    stationNames.push(station.name);
  }
  return stationNames;
};

// targetStationNameに一致するStationを取得する
const searchStation = ({
  targetStationName,
  stations,
}: {
  targetStationName: string;
  stations: Station[];
}): Station => {
  let rtnStation;
  for (const [_key, station] of Object.entries(stations)) {
    if (targetStationName === station.name) {
      rtnStation = station;
      break;
    }
  }
  return rtnStation!;
};

const calcDur = ({ start, end }: { start: string; end: string }): string => {
  let midDur = parseInt(end) - parseInt(start);
  const sec = midDur % 100;
  const min = Math.floor(midDur / 100);
  const hour = Math.floor(midDur / 10000);
  console.log(`calcDur: ${hour}:${min}:${sec}`);
  return sec + min * 60 + hour * 60 * 60 + "";
};
main();
