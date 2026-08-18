import type { IProjectConfig } from "@theatre/core";

/** Theatre.js project state — kept as TS because `*.json` is gitignored. */
export const homeHeroTheatreState = {
  definitionVersion: "0.4.0",
  revisionHistory: ["ag-hero-scroll-sequence"],
  sheetsById: {
    Hero: {
      staticOverrides: {
        byObject: {
          Rings: {
            rotationY: 0,
            y: 0,
            scale: 1,
            glow: 0.22,
          },
        },
      },
      sequence: {
        type: "PositionalSequence",
        length: 2,
        subUnitsPerUnit: 30,
        tracksByObject: {
          Rings: {
            trackIdByPropPath: {
              '["rotationY"]': "rotY",
              '["y"]': "posY",
              '["scale"]': "scl",
              '["glow"]': "glow",
            },
            trackData: {
              rotY: {
                type: "BasicKeyframedTrack",
                __debugName: 'Rings:["rotationY"]',
                keyframes: [
                  {
                    id: "a",
                    position: 0,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: 0,
                  },
                  {
                    id: "b",
                    position: 2,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: 2.4,
                  },
                ],
              },
              posY: {
                type: "BasicKeyframedTrack",
                __debugName: 'Rings:["y"]',
                keyframes: [
                  {
                    id: "c",
                    position: 0,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: 0,
                  },
                  {
                    id: "d",
                    position: 2,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: -0.55,
                  },
                ],
              },
              scl: {
                type: "BasicKeyframedTrack",
                __debugName: 'Rings:["scale"]',
                keyframes: [
                  {
                    id: "e",
                    position: 0,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: 1,
                  },
                  {
                    id: "f",
                    position: 2,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: 0.72,
                  },
                ],
              },
              glow: {
                type: "BasicKeyframedTrack",
                __debugName: 'Rings:["glow"]',
                keyframes: [
                  {
                    id: "g",
                    position: 0,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: 0.22,
                  },
                  {
                    id: "h",
                    position: 1,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: 0.55,
                  },
                  {
                    id: "i",
                    position: 2,
                    connectedRight: true,
                    handles: [0.5, 1, 0.5, 0],
                    type: "bezier",
                    value: 0.12,
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
} as IProjectConfig["state"];
