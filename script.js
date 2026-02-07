// E-Digit Finder - Optimized for GitHub Pages
// Uses lazy loading to fetch digits, with fallback for local file:// testing

// Cache for loaded digits
let digitsCache = '';
let isLoading = false;
let loadingPromise = null;

// Path to digits file (relative for GitHub Pages)
const DIGITS_FILE = 'e-digits.txt';

const MAX_DIGITS = 1000020;

// Load digits from file or fallback to embedded E_DIGITS
async function loadDigits() {
    if (digitsCache.length > 0) {
        return digitsCache;
    }

    // Check if E_DIGITS is available (loaded from e-digits.js for local testing)
    if (typeof E_DIGITS !== 'undefined' && E_DIGITS.length > 0) {
        digitsCache = E_DIGITS;
        return digitsCache;
    }

    if (isLoading) {
        return loadingPromise;
    }

    isLoading = true;

    loadingPromise = fetch(DIGITS_FILE)
        .then(response => {
            if (!response.ok) {
                throw new Error('Nie udało się załadować cyfr');
            }
            return response.text();
        })
        .then(text => {
            // Remove any whitespace and newlines
            digitsCache = text.replace(/\s/g, '');
            isLoading = false;
            return digitsCache;
        })
        .catch(error => {
            isLoading = false;
            // Fallback to E_DIGITS if available
            if (typeof E_DIGITS !== 'undefined' && E_DIGITS.length > 0) {
                digitsCache = E_DIGITS;
                return digitsCache;
            }
            throw error;
        });

    return loadingPromise;
}

// Show loading state
function showLoading() {
    const resultDiv = document.getElementById('result');
    const digitDisplay = document.getElementById('digitDisplay');
    const contextDisplay = document.getElementById('contextDisplay');
    const positionDisplay = document.getElementById('positionDisplay');

    resultDiv.classList.remove('hidden', 'error');
    positionDisplay.textContent = '...';
    digitDisplay.textContent = '⏳';
    digitDisplay.style.animation = 'none';
    contextDisplay.innerHTML = '<span class="loading-text">Ładowanie cyfr...</span>';
}

// Main function to find digit
async function findDigit() {
    const input = document.getElementById('digitPosition');
    const resultDiv = document.getElementById('result');
    const positionDisplay = document.getElementById('positionDisplay');
    const digitDisplay = document.getElementById('digitDisplay');
    const contextDisplay = document.getElementById('contextDisplay');

    const position = parseInt(input.value);

    // Validation
    if (isNaN(position) || position < 1) {
        showError(resultDiv, digitDisplay, contextDisplay, positionDisplay,
            "Podaj liczbę większą od 0");
        return;
    }

    if (position > MAX_DIGITS) {
        showError(resultDiv, digitDisplay, contextDisplay, positionDisplay,
            `Maksymalna pozycja: ${MAX_DIGITS.toLocaleString('pl-PL')}`);
        return;
    }

    // Show loading state
    showLoading();

    try {
        // Load digits if not already loaded
        const digits = await loadDigits();

        if (position > digits.length) {
            showError(resultDiv, digitDisplay, contextDisplay, positionDisplay,
                `Dostępne: ${digits.length.toLocaleString('pl-PL')} cyfr`);
            return;
        }

        // Get the digit (position is 1-indexed)
        const digit = digits[position - 1];

        // Show result
        resultDiv.classList.remove('hidden', 'error');
        positionDisplay.textContent = position.toLocaleString('pl-PL');
        digitDisplay.textContent = digit;

        // Create context (show surrounding digits)
        const contextStart = Math.max(0, position - 6);
        const contextEnd = Math.min(digits.length, position + 5);

        let contextHTML = '';

        // Add prefix if not at the start
        if (contextStart > 0) {
            contextHTML += '...';
        }

        // Build the context with highlighted digit
        for (let i = contextStart; i < contextEnd; i++) {
            if (i === position - 1) {
                contextHTML += `<span class="current">${digits[i]}</span>`;
            } else {
                contextHTML += digits[i];
            }
        }

        // Add suffix if not at the end
        if (contextEnd < digits.length) {
            contextHTML += '...';
        }

        contextDisplay.innerHTML = contextHTML;

        // Add animation
        digitDisplay.style.animation = 'none';
        setTimeout(() => {
            digitDisplay.style.animation = '';
        }, 10);

    } catch (error) {
        showError(resultDiv, digitDisplay, contextDisplay, positionDisplay,
            "Błąd ładowania cyfr");
        console.error('Error loading digits:', error);
    }
}

function showError(resultDiv, digitDisplay, contextDisplay, positionDisplay, message) {
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('error');
    positionDisplay.textContent = '?';
    digitDisplay.textContent = message;
    digitDisplay.style.animation = 'none';
    contextDisplay.innerHTML = '';
}

// Allow Enter key to trigger search
document.getElementById('digitPosition').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        findDigit();
    }
});

// Focus input on load
window.addEventListener('load', function () {
    const input = document.getElementById('digitPosition');
    if (input) input.focus();

    // Preload digits in background after page loads
    setTimeout(() => {
        loadDigits().catch(() => { });
    }, 1000);
});

// Update the info display with actual digit count
window.addEventListener('load', async function () {
    try {
        const digits = await loadDigits();
        const infoSpan = document.querySelector('.info-card:last-child .info-text span');
        if (infoSpan) {
            infoSpan.textContent = `Dostępne: ${digits.length.toLocaleString('pl-PL')} cyfr`;
        }
    } catch (e) {
        // Ignore preload errors
    }
});

// Rotating Facts
const factsData = [
    { icon: "🎂", title: "Odkrycie", content: "Liczba e została odkryta przez Jakoba Bernoulliego w 1683 roku podczas badania procentu składanego." },
    { icon: "📜", title: "Pierwszy ślad", content: "John Napier (1618) pośrednio użył liczby e w swoich tablicach logarytmów, kładąc fundament pod jej odkrycie." },
    { icon: "🔬", title: "Symbol 'e'", content: "Euler użył 'e' w 1731 (list do Goldbacha). Spopularyzował w 1748." },
    { icon: "📏", title: "Rekord świata", content: "W 2020 roku obliczono <strong>31.4 biliona</strong> cyfr e!" },
    { icon: "🧮", title: "Wzór Eulera", content: "e<sup>iπ</sup> + 1 = 0 — nazywana najpiękniejszym wzorem matematyki!" },
    { icon: "🔢", title: "Wzór 1828", content: "2.7<strong>18281828</strong>... — sekwencja 1828 pojawia się dwukrotnie na początku." },
    { icon: "📐", title: "Trójkąt", content: "Kolejne cyfry po 1828 to 45 90 45 (kąty trójkąta prostokątnego równoramiennego)." },
    { icon: "💰", title: "Google IPO", content: "W 2004 roku Google złożyło ofertę publiczną na kwotę $2,718,281,828." },
    { icon: "🌟", title: "Liczba przestępna", content: "Udowodnione przez Hermite'a w 1873 r. Nie jest pierwiastkiem żadnego równania o całk. współczynnikach." },
    { icon: "🎲", title: "Nieporządek", content: "Szansa, że losowa permutacja nie ma punktów stałych dąży do 1/e (ok. 36.8%)." },
    { icon: "🌀", title: "Silnia", content: "e = 1/0! + 1/1! + 1/2! + 1/3! + ... (suma odwrotności silni)." },
    { icon: "⚡", title: "Analiza", content: "Funkcja f(x) = e^x jest jedyną funkcją, która jest równa swojej pochodnej." },
    { icon: "🐚", title: "Spirala", content: "Spirala logarytmiczna (związana z e) występuje w muszlach, huraganach i galaktykach." },
    { icon: "📐", title: "Całka", content: "Pole pod krzywą y = 1/x od 1 do e wynosi dokładnie 1." },
    { icon: "🧊", title: "Poisson", content: "e pojawia się w rozkładzie Poissona opisującym rzadkie zdarzenia (np. liczbę maili na godzinę)." },
    { icon: "🎯", title: "Optymalny wybór", content: "Zasada 37%: Przejrzyj 1/e (37%) kandydatów, potem wybierz pierwszego lepszego od nich!" }
];

function initRotatingFacts() {
    const leftSlots = [
        document.getElementById('fact-left-1'),
        document.getElementById('fact-left-2'),
        document.getElementById('fact-left-3')
    ];
    const rightSlots = [
        document.getElementById('fact-right-1'),
        document.getElementById('fact-right-2'),
        document.getElementById('fact-right-3')
    ];

    // Combine all slots
    const allSlots = [...leftSlots, ...rightSlots];

    // Filter out null slots (in case some are missing)
    const validSlots = allSlots.filter(s => s !== null);

    if (validSlots.length === 0) return;

    // Function to update a random slot
    function updateRandomSlot() {
        // Pick a random slot
        const randomSlotIndex = Math.floor(Math.random() * validSlots.length);
        const slot = validSlots[randomSlotIndex];

        // Pick a random fact
        const randomFactIndex = Math.floor(Math.random() * factsData.length);
        const fact = factsData[randomFactIndex];

        // Check if this fact is already displayed in another slot to avoid duplicates
        // (Simple check by title)
        const currentTitles = validSlots.map(s => s.querySelector('h3').textContent);
        if (currentTitles.includes(fact.title)) {
            // Try again next time if duplicate
            return;
        }

        // Animate out
        slot.classList.add('fade-out');

        setTimeout(() => {
            // Update content
            const iconEl = slot.querySelector('.fact-icon');
            const titleEl = slot.querySelector('h3');
            const contentEl = slot.querySelector('p');

            if (iconEl) iconEl.textContent = fact.icon;
            if (titleEl) titleEl.textContent = fact.title;
            if (contentEl) contentEl.innerHTML = fact.content;

            // Animate in
            slot.classList.remove('fade-out');
        }, 400); // Wait for transition
    }

    // Start rotation interval (every 4 seconds)
    setInterval(updateRandomSlot, 4000);
}

// Start when loaded
window.addEventListener('load', initRotatingFacts);
