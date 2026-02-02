export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  private ensureContext() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playBeep(frequency: number = 440, type: OscillatorType = 'sine', duration: number = 0.1) {
    if (!this.audioContext || !this.masterGain) return;
    this.ensureContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  playStartSound() {
    // A rising arpeggio
    this.playBeep(440, 'triangle', 0.1);
    setTimeout(() => this.playBeep(554, 'triangle', 0.1), 100);
    setTimeout(() => this.playBeep(659, 'triangle', 0.2), 200);
  }

  playPop() {
    this.playBeep(800, 'sine', 0.05);
  }

  playBGM() {
    // Placeholder: real generative BGM is complex. 
    // We could make a simple looped drone, but silence is better than annoyance.
  }

  setVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = val;
    }
  }
}

export const audioManager = new AudioManager();
