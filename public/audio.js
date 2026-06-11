(() => {
  const button = document.getElementById("soundToggle");
  if (!button) return;

  const TRACK_URL = "/rpstore-ambient.wav?v=2";
  const STORAGE_KEY = "rpstoreAmbientMusic";

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  let player = null;
  let synthContext = null;
  let synthNodes = [];
  let synthTimer = null;
  let isPlaying = false;

  function savePreference(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }

  function setButtonState(enabled, label) {
    button.textContent = label || (enabled ? "Music on" : "Music off");
    button.setAttribute("aria-pressed", String(enabled));
    button.classList.toggle("is-on", enabled);
  }

  function stopSynth() {
    if (synthTimer) {
      clearInterval(synthTimer);
      synthTimer = null;
    }

    synthNodes.forEach(({ osc, gain }) => {
      try {
        osc.stop();
      } catch (_) {}
      try {
        gain.disconnect();
      } catch (_) {}
    });
    synthNodes = [];

    if (synthContext) {
      try {
        synthContext.close();
      } catch (_) {}
      synthContext = null;
    }
  }

  function setSynthChord(context, rootIndex = 0) {
    if (!synthContext || !synthNodes.length) return;
    const chords = [
      [196.0, 246.94, 293.66],
      [174.61, 220.0, 261.63],
      [164.81, 207.65, 246.94],
      [220.0, 277.18, 329.63]
    ];
    const chord = chords[rootIndex % chords.length];
    synthNodes.forEach((node, index) => {
      node.osc.frequency.setTargetAtTime(chord[index], context.currentTime, 1.4);
    });
  }

  async function startAudioTrack() {
    if (player) {
      player.loop = true;
      player.volume = 0.26;
      await player.play();
      return;
    }

    const audio = new Audio(TRACK_URL);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.26;
    audio.crossOrigin = "anonymous";
    player = audio;
    await player.play();
  }

  async function startSynthFallback() {
    if (!AudioContextClass) throw new Error("AudioContext unavailable");

    synthContext = new AudioContextClass();
    await synthContext.resume();

    const master = synthContext.createGain();
    master.gain.value = 0.00008;
    master.connect(synthContext.destination);

    const filter = synthContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 720;
    filter.Q.value = 0.7;
    filter.connect(master);

    synthNodes = [0, 1, 2].map((index) => {
      const osc = synthContext.createOscillator();
      const gain = synthContext.createGain();
      osc.type = index === 1 ? "triangle" : "sine";
      gain.gain.value = index === 0 ? 0.032 : index === 1 ? 0.026 : 0.02;
      osc.connect(gain);
      gain.connect(filter);
      osc.start();
      return { osc, gain };
    });

    const lfo = synthContext.createOscillator();
    const lfoGain = synthContext.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();

    setSynthChord(synthContext, 0);
    let chordIndex = 0;
    synthTimer = window.setInterval(() => {
      chordIndex += 1;
      setSynthChord(synthContext, chordIndex);
    }, 7000);

    master.gain.setTargetAtTime(0.045, synthContext.currentTime, 1.8);
    setTimeout(() => {
      try {
        lfo.stop();
      } catch (_) {}
      try {
        lfo.disconnect();
      } catch (_) {}
      try {
        lfoGain.disconnect();
      } catch (_) {}
    }, 1000);
  }

  async function startMusic() {
    if (isPlaying) return;

    try {
      await startAudioTrack();
      isPlaying = true;
      setButtonState(true, "Music on");
      savePreference("on");
      return;
    } catch (error) {
      console.warn("Ambient track playback failed, falling back to synth music", error);
    }

    try {
      await startSynthFallback();
      isPlaying = true;
      setButtonState(true, "Music on");
      savePreference("on");
    } catch (error) {
      console.error("Ambient music failed to start", error);
      setButtonState(false, "Music blocked");
      savePreference("off");
    }
  }

  function stopMusic() {
    if (!isPlaying) return;

    if (player) {
      try {
        player.pause();
        player.currentTime = 0;
      } catch (_) {}
    }

    stopSynth();
    player = null;
    isPlaying = false;
    setButtonState(false, "Music off");
    savePreference("off");
  }

  button.addEventListener("click", async () => {
    if (isPlaying) {
      stopMusic();
      return;
    }

    button.disabled = true;
    setButtonState(false, "Starting...");

    try {
      await startMusic();
    } finally {
      button.disabled = false;
    }
  });

  window.addEventListener("beforeunload", () => {
    stopMusic();
  });

  setButtonState(false, "Music off");
})();
