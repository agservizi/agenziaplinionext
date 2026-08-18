type LottieLayer = Record<string, unknown>;

function pulseShape(color: [number, number, number], name: string): LottieLayer {
  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: 0, s: [55], e: [100], i: { x: [0.67], y: [1] }, o: { x: [0.33], y: [0] } },
          { t: 30, s: [100], e: [55], i: { x: [0.67], y: [1] }, o: { x: [0.33], y: [0] } },
          { t: 60, s: [55] },
        ],
      },
      r: {
        a: 1,
        k: [
          { t: 0, s: [0], e: [180], i: { x: [0.67], y: [1] }, o: { x: [0.33], y: [0] } },
          { t: 60, s: [180] },
        ],
      },
      p: { a: 0, k: [32, 32, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          { t: 0, s: [86, 86, 100], e: [118, 118, 100], i: { x: [0.67], y: [1] }, o: { x: [0.33], y: [0] } },
          { t: 30, s: [118, 118, 100], e: [86, 86, 100], i: { x: [0.67], y: [1] }, o: { x: [0.33], y: [0] } },
          { t: 60, s: [86, 86, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [
      { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [26, 26] }, nm: "ellipse" },
      { ty: "st", c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, lj: 2 },
      { ty: "fl", c: { a: 0, k: [...color, 0.32] }, o: { a: 0, k: 100 }, r: 1 },
    ],
    ip: 0,
    op: 60,
    st: 0,
  };
}

export const sparkLottie = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 64,
  h: 64,
  nm: "ag-spark",
  ddd: 0,
  assets: [],
  layers: [pulseShape([0.133, 0.827, 0.933], "spark")],
};

export const packageLottie = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 64,
  h: 64,
  nm: "ag-package",
  ddd: 0,
  assets: [],
  layers: [pulseShape([0.369, 0.055, 0.843], "package")],
};

export const sendLottie = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 64,
  h: 64,
  nm: "ag-send",
  ddd: 0,
  assets: [],
  layers: [pulseShape([0.659, 0.333, 0.969], "send")],
};

export const LOTTIE_ICONS = {
  spark: sparkLottie,
  package: packageLottie,
  send: sendLottie,
} as const;
