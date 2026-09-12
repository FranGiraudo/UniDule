export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;

  constructor() {}

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public play(type: 'rain' | 'white' | 'none') {
    this.stop();
    if (type === 'none') return;
    
    this.init();
    if (!this.ctx) return;
    
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'rain') {
      // Brown noise for soft rain
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compensate for gain
      }
    }

    this.source = this.ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = true;

    this.gainNode = this.ctx.createGain();
    
    // Soft volume by default
    this.gainNode.gain.value = type === 'rain' ? 0.6 : 0.05; // White noise is perceived very loud

    if (type === 'rain') {
      // Add a lowpass filter to make it sound like rain (muffled, soft)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800; // Soft rain frequency
      
      this.source.connect(filter);
      filter.connect(this.gainNode);
    } else {
      // White noise direct
      this.source.connect(this.gainNode);
    }
    
    this.gainNode.connect(this.ctx.destination);
    
    this.source.start(0);
    this.isPlaying = true;
  }

  public stop() {
    if (this.source && this.isPlaying) {
      this.source.stop();
      this.source.disconnect();
      this.source = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
  }
}

export const ambientAudio = new AmbientAudio();
