// Create a simple notification sound using Web Audio API
export const playNotificationSound = () => {
  try {
    // Check if Web Audio API is supported
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency for a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      // Set volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

export type NotificationSoundSetting =
  | { mode: 'file'; src: string }
  | { mode: 'preset'; preset: 'bell' | 'chime' | 'pop' | 'ding' | 'digital' };

export const playNotificationSoundFromFile = async (src: string) => {
  try {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    await audio.play();
  } catch (error) {
    console.error('Error playing audio file:', error);
    // Fallback to synthetic beep
    playNotificationSound();
  }
};

export const playNotificationPreset = async (
  preset: 'bell' | 'chime' | 'pop' | 'ding' | 'digital'
) => {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return playNotificationSound();
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const createTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', startGain = 0.001, peakGain = 0.25) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);
      g.gain.setValueAtTime(startGain, now + start);
      g.gain.linearRampToValueAtTime(peakGain, now + start + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      osc.connect(g);
      g.connect(gain);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    };

    switch (preset) {
      case 'bell': {
        // Two descending tones with gentle decay
        createTone(880, 0, 0.18, 'triangle', 0.001, 0.28);
        createTone(660, 0.12, 0.22, 'triangle', 0.001, 0.24);
        break;
      }
      case 'chime': {
        // Soft three-note arpeggio
        createTone(523.25, 0, 0.16, 'sine', 0.001, 0.22); // C5
        createTone(659.25, 0.08, 0.16, 'sine', 0.001, 0.2); // E5
        createTone(783.99, 0.16, 0.24, 'sine', 0.001, 0.18); // G5
        break;
      }
      case 'pop': {
        // Quick upward blip
        createTone(220, 0, 0.08, 'square', 0.001, 0.2);
        createTone(440, 0.04, 0.06, 'square', 0.001, 0.18);
        break;
      }
      case 'ding': {
        // Single bright ding with slight vibrato
        createTone(1046.5, 0, 0.3, 'sine', 0.001, 0.22);
        break;
      }
      case 'digital': {
        // Short digital arpeggio
        createTone(1200, 0, 0.08, 'sawtooth', 0.001, 0.15);
        createTone(900, 0.06, 0.08, 'sawtooth', 0.001, 0.14);
        createTone(1200, 0.12, 0.12, 'sawtooth', 0.001, 0.12);
        break;
      }
      default: {
        playNotificationSound();
      }
    }
  } catch (error) {
    console.error('Error playing preset sound:', error);
    playNotificationSound();
  }
};