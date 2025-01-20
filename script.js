let midiAccess = null;

// Connect to MIDI devices
async function connectMIDI() {
  try {
    midiAccess = await navigator.requestMIDIAccess();
    console.log('MIDI Access granted:', midiAccess);
    populateMIDIInputs();
  } catch (error) {
    console.error('Failed to access MIDI devices:', error);
  }
}

// Populate MIDI inputs in the dropdown
function populateMIDIInputs() {
  const inputSelect = document.getElementById('midi-inputs');
  inputSelect.innerHTML = ''; // Clear existing options

  for (let input of midiAccess.inputs.values()) {
    const option = document.createElement('option');
    option.value = input.id;
    option.textContent = input.name || `Device ${input.id}`;
    inputSelect.appendChild(option);
  }

  inputSelect.addEventListener('change', handleMIDIInputChange);
}

// Handle MIDI input selection
function handleMIDIInputChange(event) {
  const inputId = event.target.value;
  const selectedInput = Array.from(midiAccess.inputs.values()).find(input => input.id === inputId);
  
  if (selectedInput) {
    selectedInput.onmidimessage = logMIDIMessage;
  }
}

// Log MIDI messages
function logMIDIMessage(event) {
  const log = document.getElementById('midi-log');
  const [status, data1, data2] = event.data;
  log.value += `Status: ${status}, Data1: ${data1}, Data2: ${data2}\n`;
  log.scrollTop = log.scrollHeight; // Auto-scroll to the latest message
}

document.getElementById('connect').addEventListener('click', connectMIDI);

// Default ADSR values
let adsr = {
  attack: 0.5,
  decay: 0.5,
  sustain: 0.5,
  release: 0.5,
};

// Update ADSR values dynamically
function updateADSR() {
  adsr.attack = parseFloat(document.getElementById('attack').value);
  adsr.decay = parseFloat(document.getElementById('decay').value);
  adsr.sustain = parseFloat(document.getElementById('sustain').value);
  adsr.release = parseFloat(document.getElementById('release').value);

  // Update displayed values
  document.getElementById('attack-value').textContent = adsr.attack;
  document.getElementById('decay-value').textContent = adsr.decay;
  document.getElementById('sustain-value').textContent = adsr.sustain;
  document.getElementById('release-value').textContent = adsr.release;
}

// Attach event listeners to sliders
document.getElementById('attack').addEventListener('input', updateADSR);
document.getElementById('decay').addEventListener('input', updateADSR);
document.getElementById('sustain').addEventListener('input', updateADSR);
document.getElementById('release').addEventListener('input', updateADSR);

// Apply ADSR envelope to MIDI notes (example)
function applyADSR(note, velocity) {
  const currentTime = performance.now() / 1000;

  // Simulate the ADSR envelope for demonstration purposes
  console.log(`Note ${note} triggered with ADSR envelope:
    Attack: ${adsr.attack}s,
    Decay: ${adsr.decay}s,
    Sustain: ${adsr.sustain},
    Release: ${adsr.release}s`);
  
  // Example integration: Map velocity using ADSR
  const adjustedVelocity = Math.min(
    velocity * adsr.sustain + (1 - adsr.sustain),
    127
  );
  return adjustedVelocity;
}

// Modify MIDI message logging to include ADSR logic
function logMIDIMessage(event) {
  const log = document.getElementById('midi-log');
  const [status, data1, data2] = event.data;

  // Apply ADSR to Note On messages (status 0x90)
  if ((status & 0xf0) === 0x90 && data2 > 0) {
    const adjustedVelocity = applyADSR(data1, data2);
    log.value += `Note On: ${data1}, Velocity: ${data2} → Adjusted: ${adjustedVelocity}\n`;
  } else {
    log.value += `Status: ${status}, Data1: ${data1}, Data2: ${data2}\n`;
  }
  log.scrollTop = log.scrollHeight; // Auto-scroll to the latest message
}
