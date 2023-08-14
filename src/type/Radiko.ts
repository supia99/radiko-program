export type RadikoResponse = {
  radiko: {
    ttl: string;
    srvtime: string;
    stations: { station: Station[] };
  };
};

export type Station = {
  $: {id: string};
  name: string;
  progs: { date: string; prog: Prog[] };
};

export type Prog = {
  $: {
    // 開始日時 
    ft: string;
    // 終了日時 
    to: string;
    // // 開始時間(%2h%2m) 
    // ftl: string;
    // // 終了時間(%2h%2m)
    // tol: string;
    //  放送の時間の長さ(s)
    dur: string
  };
  title: string;
  // url: string;
  // url_link: string;
  // 出演者名
  pfm: string;
  info: string;
  // img: string;
};
