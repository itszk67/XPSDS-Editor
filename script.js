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
