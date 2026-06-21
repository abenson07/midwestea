import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let scrollTriggerRegistered = false;
let observerRegistered = false;
let slideshowEaseCreated = false;

export function ensureGsapScrollTrigger() {
  if (typeof window === "undefined" || scrollTriggerRegistered) return;
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
}

export function ensureGsapObserver() {
  if (typeof window === "undefined" || observerRegistered) return;
  gsap.registerPlugin(Observer, CustomEase);
  observerRegistered = true;
}

export function ensureSlideshowEase() {
  if (typeof window === "undefined" || slideshowEaseCreated) return;
  ensureGsapObserver();
  CustomEase.create("slideshow-wipe", "0.6, 0.08, 0.02, 0.99");
  slideshowEaseCreated = true;
}

export { gsap, ScrollTrigger, Observer, CustomEase };
