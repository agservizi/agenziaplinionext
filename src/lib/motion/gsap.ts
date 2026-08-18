import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";

let registered = false;

export function registerGsapPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(
    ScrollTrigger,
    Observer,
    ScrollToPlugin,
    Flip,
    SplitText,
    CustomEase,
    MotionPathPlugin,
    DrawSVGPlugin,
    ScrambleTextPlugin,
    TextPlugin,
  );
  CustomEase.create("agExpo", "M0,0 C0.16,1 0.3,1 1,1");
  CustomEase.create("agCinematic", "M0,0 C0.22,1 0.36,1 1,1");
  CustomEase.create("agSoft", "M0,0 C0.4,0 0.2,1 1,1");
  registered = true;
}

export {
  CustomEase,
  DrawSVGPlugin,
  Flip,
  gsap,
  MotionPathPlugin,
  Observer,
  ScrambleTextPlugin,
  ScrollToPlugin,
  ScrollTrigger,
  SplitText,
  TextPlugin,
};
