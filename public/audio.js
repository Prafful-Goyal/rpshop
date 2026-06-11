(() => {
  const button = document.getElementById("soundToggle");
  if (!button) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    button.disabled = true;
    button.textContent = "Music unavailable";
    return;
  }

  const chords = [
    [196.0, 246.94, 293.66],
    [174.61, 220.0, 261.63],
    [164.81, 207.65, 246.94],
    [220.0, 277.18, 329.63]
  ];

  let context = null;
  let masterGain = null;
  let filter = null;
  let lfo = null;
  let lfoGain = null;
  let voices = [];
  let cycleTimer = null;
  let isPlaying = false;

  function setButtonState(enabled) {
    button.textContent = enabled ? "Music on" : "Music off";
    button.setAttribute("aria-pressed", String(enabled));
    button.classList.toggle("is-on", enabled);
  }

  function stopNodes() {
    voices.forEach(({ osc, amp }) => {
      try {
        osc.stop();
      } catch (_) {}
      try {
        amp.disconnect();
      } catch (_) {}
    });
    voices = [];

    if (lfo) {
      try {
        lfo.stop();
      } catch (_) {}
      try {
        lfo.disconnect();
      } catch (_) {}
      lfo = null;
    }

    if (lfoGain) {
      try {
        lfoGain.disconnect();
      } catch (_) {}
      lfoGain = null;
    }

    if (filter) {
      try {
        filter.disconnect();
      } catch (_) {}
      filter = null;
    }

    if (masterGain) {
      try {
        masterGain.disconnect();
      } catch (_) {}
      masterGain = null;
    }
  }

  function updateChord(index = 0) {
    if (!context || !voices.length) return;
    const chord = chords[index % chords.length];
    voices.forEach((voice, voiceIndex) => {
      voice.osc.frequency.setTargetAtTime(chord[voiceIndex], context.currentTime, 1.5);
    });
  }

  async function startMusic() {
    if (isPlaying) return;

    context = new AudioContextClass();
    await context.resume();

    masterGain = context.createGain();
    masterGain.gain.value = 0.0001;

    filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 640;
    filter.Q.value = 0.6;

    filter.connect(masterGain);
    masterGain.connect(context.destination);

    voices = [0, 1, 2].map((index) => {
      const osc = context.createOscillator();
      const amp = context.createGain();
      osc.type = index === 1 ? "triangle" : "sine";
      amp.gain.value = index === 0 ? 0.028 : index === 1 ? 0.02 : 0.016;
      osc.connect(amp);
      amp.connect(filter);
      osc.start();
      return { osc, amp };
    });

    lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.055;
    lfoGain = context.createGain();
    lfoGain.gain.value = 0.0045;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    updateChord(0);
    let chordIndex = 0;
    cycleTimer = window.setInterval(() => {
      chordIndex += 1;
      updateChord(chordIndex);
    }, 9000);

    masterGain.gain.setTargetAtTime(0.028, context.currentTime, 2.2);
    isPlaying = true;
    setButtonState(true);
    localStorage.setItem("rpstoreAmbientMusic", "on");
  }

  function stopMusic() {
    if (!isPlaying || !context || !masterGain) return;

    masterGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.9);

    window.setTimeout(async () => {
      clearInterval(cycleTimer);
      cycleTimer = null;
      stopNodes();
      try {
        await context.close();
      } catch (_) {}
      context = null;
      isPlaying = false;
      setButtonState(false);
      localStorage.setItem("rpstoreAmbientMusic", "off");
    }, 1000);
  }

  button.addEventListener("click", async () => {
    try {
      if (!isPlaying) {
        await startMusic();
      } else {
        stopMusic();
      }
    } catch (error) {
      button.textContent = "Music blocked";
      console.error("Ambient music failed to start", error);
    }
  });

  window.addEventListener("beforeunload", () => {
    clearInterval(cycleTimer);
    stopNodes();
    try {
      context?.close();
    } catch (_) {}
  });

  setButtonState(false);
})();
