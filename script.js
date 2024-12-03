const MORSE_CODE_DICT = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '0': '-----', ' ': ' '
};

const SHORT_SIGNAL = 200; // in milliseconds
const LONG_SIGNAL = 600;

let currentTimeouts = []; // To store active timeouts and intervals

// Updates the lamp visualization
function setLampColor(isOn) {
    const lamp = document.getElementById('lamp');
    lamp.style.backgroundColor = isOn ? 'yellow' : 'black';
}

// Sends a request to the server to toggle the light and updates the visualization
function toggleLight(state) {
    const url = state ? "https://theramatch.de/gpio?state=HIGH" : "https://theramatch.de/gpio?state=LOW";
    setLampColor(state); // Update visualization immediately
    fetch(url, { mode: 'no-cors' })
        .then(() => console.log(`Lampe ${state ? 'an' : 'aus'}`))
        .catch(err => console.error("Fehler:", err));


}

// Converts text into Morse code and blinks the lamp accordingly
function blinkMorse() {
    abortAction(); // Ensure no other actions are running
    const message = document.getElementById('message').value.toUpperCase();
    const morseSequence = [];

    for (const char of message) {
        if (MORSE_CODE_DICT[char]) {
            const code = MORSE_CODE_DICT[char];
            for (const symbol of code) {
                morseSequence.push(symbol === '.' ? SHORT_SIGNAL : LONG_SIGNAL);
                morseSequence.push(0); // Pause between signals
            }
            morseSequence.push(LONG_SIGNAL); // Pause between letters
        }
    }

    // Start blinking sequence
    (function blink(sequence) {
        if (sequence.length === 0) return;

        const duration = sequence.shift();
        if (duration > 0) {
            setLampColor(true);
            currentTimeouts.push(setTimeout(() => {
                setLampColor(false);
                currentTimeouts.push(setTimeout(() => blink(sequence), 200));
            }, duration));
        } else {
            currentTimeouts.push(setTimeout(() => blink(sequence), 200));
        }
    })(morseSequence);
}

// Starts a spam mode with rapid blinking
function startSpam() {
    abortAction(); // Ensure no other actions are running
    const interval = setInterval(() => {
        setLampColor(true);
        currentTimeouts.push(setTimeout(() => setLampColor(false), 100));
    }, 200);
    currentTimeouts.push(interval);

    // Automatically stop spam after 5 seconds to prevent indefinite loop

}

// Stops all running actions
function abortAction() {
    // Clear all active timeouts and intervals
    currentTimeouts.forEach(timeout => clearTimeout(timeout));
    currentTimeouts = [];

    // Turn off the lamp visualization and reset the light
    setLampColor(false);
    fetch("https://theramatch.de/gpio?state=LOW")
        .then(() => console.log("Alle Aktionen abgebrochen und Lampe ausgeschaltet"))
        .catch(err => console.error("Fehler beim Abbruch:", err));
}
