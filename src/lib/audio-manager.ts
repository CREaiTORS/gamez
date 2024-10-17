import { Howl } from "howler";

export class AudioManager {
  private SOUNDS: Record<string, Howl>;
  private backgroundTrackPaused?: boolean;
  private backgroundTrack?: string;

  constructor() {
    this.SOUNDS = {};

    window.addEventListener("focus", () => {
      this.backgroundContinue();
    });

    window.addEventListener("blur", () => {
      this.backgroundPause();
    });
  }

  load(name: string, src: string) {
    this.SOUNDS[name] = new Howl({ src });
  }

  play(name: string) {
    if (!this.SOUNDS[name]) return;

    this.SOUNDS[name].play();
  }

  backgroundPlay(name: string) {
    const sound = this.SOUNDS[name];
    if (!sound) return;

    this.backgroundPause();

    this.backgroundTrack = name;

    sound.play();
    sound.volume(0.33);
    sound.loop(true);
  }

  backgroundContinue() {
    if (this.backgroundTrackPaused && this.backgroundTrack) {
      this.backgroundPlay(this.backgroundTrack);
      this.backgroundTrackPaused = false;
    }
  }

  backgroundPause() {
    if (this.backgroundTrack) {
      this.SOUNDS[this.backgroundTrack].pause();
      this.backgroundTrackPaused = true;
    }
  }
}
