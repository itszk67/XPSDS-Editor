let midiAccess = null;
let testMode = false;

// Default ADSR values
let adsr = {
  attack: 0.5,
  decay: 0.5,
  sustain: 0.5,
  release: 0.5,
};

const canvas = document.createElement('canvas');
canvas.id = 'adsr-canvas';
canvas.width = 500;
canvas.height = 200;
document.getElementById('adsr-editor').appendChild(canvas);
const ctx = canvas.getContext('2d');

// Connect to MIDI devices or enable test mode
async function connectMIDI() {
  try {
    midiAccess = await navigator.requestMIDIAccess();
    populateMIDIInputs();
  } catch (error) {
    console.warn('MIDI access failed. Enabling Test Mode.');
    enableTestMode();
  }
}

// Populate MIDI inputs
function populateMIDIInputs() {
  const inputSelect = document.getElementById('midi-inputs');
  inputSelect.innerHTML = '';

  for (let input of midiAccess.inputs.values()) {
    const option = document.createElement('option');
    option.value = input.id;
    option.textContent = input.name || `Device ${input.id}`;
    inputSelect.appendChild(option);
  }

  inputSelect.addEventListener('change', handleMIDIInputChange);
}

function handleMIDIInputChange(event) {
  const inputId = event.target.value;
  const selectedInput = Array.from(midiAccess.inputs.values()).find(input => input.id === inputId);
  
  if (selectedInput) {
    selectedInput.onmidimessage = logMIDIMessage;
  }
}

// Update ADSR values dynamically
function updateADSR() {
  adsr.attack = parseFloat(document.getElementById('attack').value);
  adsr.decay = parseFloat(document.getElementById('decay').value);
  adsr.sustain = parseFloat(document.getElementById('sustain').value);
  adsr.release = parseFloat(document.getElementById('release').value);

  document.getElementById('attack-value').textContent = adsr.attack;
  document.getElementById('decay-value').textContent = adsr.decay;
  document.getElementById('sustain-value').textContent = adsr.sustain;
  document.getElementById('release-value').textContent = adsr.release;

  drawADSR();
}

// Draw the ADSR envelope on the canvas
function drawADSR() {
  const width = canvas.width;
  const height = canvas.height;
  const padding = 10;
  const totalDuration = adsr.attack + adsr.decay + adsr.release + 1; // Simplified

  ctx.clearRect(0, 0, width, height);

  // Map times to canvas coordinates
  const attackX = (adsr.attack / totalDuration) * (width - 2 * padding);
  const decayX = attackX + (adsr.decay / totalDuration) * (width - 2 * padding);
  const sustainLevel = height - adsr.sustain * (height - 2 * padding);
  const releaseX = decayX + ((1 / totalDuration) * (width - 2 * padding));

  // Draw the envelope
  ctx.beginPath();
  ctx.moveTo(padding, height); // Start at bottom-left
  ctx.lineTo(padding + attackX, padding); // Attack peak
  ctx.lineTo(padding + decayX, sustainLevel); // Decay to sustain
  ctx.lineTo(width - padding, sustainLevel); // Sustain level
  ctx.lineTo(width - padding, height); // Release to baseline
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Enable test mode
function enableTestMode() {
  testMode = true;

  const testButton = document.createElement('button');
  testButton.textContent = 'Simulate MIDI Message';
  testButton.id = 'simulate-midi';
  testButton.addEventListener('click', simulateMIDIMessage);
  document.getElementById('midi-interface').appendChild(testButton);

  console.log('Test Mode Enabled.');
}

// Simulate MIDI messages
function simulateMIDIMessage() {
  if (!testMode) return;

  const note = Math.floor(Math.random() * 128);
  const velocity = Math.floor(Math.random() * 128);
  const simulatedEvent = { data: [0x90, note, velocity] };

  logMIDIMessage(simulatedEvent);
}

function logMIDIMessage(event) {
  const log = document.getElementById('midi-log');
  const [status, data1, data2] = event.data;

  if ((status & 0xf0) === 0x90 && data2 > 0) {
    log.value += `Note On: ${data1}, Velocity: ${data2}\n`;
  } else {
    log.value += `Status: ${status}, Data1: ${data1}, Data2: ${data2}\n`;
  }
  log.scrollTop = log.scrollHeight;
}

// Attach slider event listeners
document.getElementById('attack').addEventListener('input', updateADSR);
document.getElementById('decay').addEventListener('input', updateADSR);
document.getElementById('sustain').addEventListener('input', updateADSR);
document.getElementById('release').addEventListener('input', updateADSR);

document.getElementById('connect').addEventListener('click', connectMIDI);

// Initialize the ADSR visualization
drawADSR();
