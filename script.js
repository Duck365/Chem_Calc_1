// --- 1. PERIODIC TABLE DATABASE ---
// Contains Symbol, Name, Mass, and Type (used to determine Formula Unit vs Molecular Formula)
const elementsDB = {
    "H": { name: "Hydrogen", mass: 1.01, type: "nonmetal" },
    "He": { name: "Helium", mass: 4.00, type: "nonmetal" },
    "Li": { name: "Lithium", mass: 6.94, type: "metal" },
    "Be": { name: "Beryllium", mass: 9.01, type: "metal" },
    "B": { name: "Boron", mass: 10.81, type: "metalloid" },
    "C": { name: "Carbon", mass: 12.01, type: "nonmetal" },
    "N": { name: "Nitrogen", mass: 14.01, type: "nonmetal" },
    "O": { name: "Oxygen", mass: 16.00, type: "nonmetal" },
    "F": { name: "Fluorine", mass: 19.00, type: "nonmetal" },
    "Ne": { name: "Neon", mass: 20.18, type: "nonmetal" },
    "Na": { name: "Sodium", mass: 22.99, type: "metal" },
    "Mg": { name: "Magnesium", mass: 24.31, type: "metal" },
    "Al": { name: "Aluminum", mass: 26.98, type: "metal" },
    "Si": { name: "Silicon", mass: 28.09, type: "metalloid" },
    "P": { name: "Phosphorus", mass: 30.97, type: "nonmetal" },
    "S": { name: "Sulfur", mass: 32.06, type: "nonmetal" },
    "Cl": { name: "Chlorine", mass: 35.45, type: "nonmetal" },
    "Ar": { name: "Argon", mass: 39.95, type: "nonmetal" },
    "K": { name: "Potassium", mass: 39.10, type: "metal" },
    "Ca": { name: "Calcium", mass: 40.08, type: "metal" },
    "Cr": { name: "Chromium", mass: 52.00, type: "metal" },
    "Mn": { name: "Manganese", mass: 54.94, type: "metal" },
    "Fe": { name: "Iron", mass: 55.85, type: "metal" },
    "Co": { name: "Cobalt", mass: 58.93, type: "metal" },
    "Ni": { name: "Nickel", mass: 58.69, type: "metal" },
    "Cu": { name: "Copper", mass: 63.55, type: "metal" },
    "Zn": { name: "Zinc", mass: 65.38, type: "metal" },
    "Ag": { name: "Silver", mass: 107.87, type: "metal" },
    "Au": { name: "Gold", mass: 196.97, type: "metal" },
    "Hg": { name: "Mercury", mass: 200.59, type: "metal" },
    "Pb": { name: "Lead", mass: 207.2, type: "metal" }
    // Note: You can easily add the rest of the 118 elements following this exact format!
};

// Known compounds dictionary for nice naming
const knownCompounds = {
    "NaOH": "Sodium Hydroxide",
    "Cr2(SO4)3": "Chromium (III) Sulfate",
    "H2O": "Water",
    "CO2": "Carbon Dioxide",
    "NaCl": "Sodium Chloride",
    "C4H9O2": "Butyl Acetate Isomer" // Example fallback name
};

// --- 2. SCREEN NAVIGATION ---
document.getElementById('open-calc-btn').addEventListener('click', () => {
    document.getElementById('main-menu').classList.remove('active');
    document.getElementById('calculator-page').classList.add('active');
    document.getElementById('chem-input').focus();
});

document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('calculator-page').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
});

// --- 3. INPUT HANDLING ---
const inputField = document.getElementById('chem-input');
inputField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        processInput(this.value.trim());
    }
});

// --- 4. CORE LOGIC ---
function processInput(input) {
    const outputContent = document.getElementById('output-content');
    
    if (!input) {
        outputContent.innerHTML = `<div class="placeholder-text">Please enter a valid formula or element.</div>`;
        return;
    }

    // Step 1: Check if input is a full element name (e.g., "Silicon")
    let formula = input;
    const lowerInput = input.toLowerCase();
    for (const [symbol, data] of Object.entries(elementsDB)) {
        if (data.name.toLowerCase() === lowerInput) {
            formula = symbol; // Convert "Silicon" to "Si"
            break;
        }
    }

    // Step 2: Clean underscores for parser, but keep original for display if needed
    const cleanFormula = formula.replace(/_/g, '');
    
    // Step 3: Parse formula to count elements
    const elementCounts = parseChemicalFormula(cleanFormula);
    if (!elementCounts || Object.keys(elementCounts).length === 0) {
        outputContent.innerHTML = `<div class="placeholder-text" style="color: red;">Invalid formula. Please check your spelling and capitalization (e.g. NaOH).</div>`;
        return;
    }

    // Step 4: Calculate Stats
    let totalMass = 0;
    let totalAtoms = 0;
    let hasMetal = false;
    let breakdownHTML = '';

    for (const [symbol, count] of Object.entries(elementCounts)) {
        if (!elementsDB[symbol]) {
            outputContent.innerHTML = `<div class="placeholder-text" style="color: red;">Unknown element: ${symbol}</div>`;
            return;
        }
        
        const elData = elementsDB[symbol];
        if (elData.type === 'metal') hasMetal = true;

        const massContrib = elData.mass * count;
        totalMass += massContrib;
        totalAtoms += count;

        breakdownHTML += `<li><span>${symbol} * ${count}:</span> <span>${massContrib.toFixed(2)}</span></li>`;
    }

    // Step 5: Determine Representative Particle & Display Name
    const uniqueElements = Object.keys(elementCounts).length;
    let particleType = "";
    
    if (totalAtoms === 1) {
        particleType = "Atom";
    } else if (hasMetal) {
        particleType = "Formula Unit";
    } else {
        particleType = "Molecular Formula";
    }

    // Determine the name (Look up in dict, or format the formula nicely)
    let displayName = knownCompounds[cleanFormula] || elementsDB[cleanFormula]?.name;
    
    if (!displayName) {
        // If not a known compound, just make the formula look pretty (H_2O -> H₂O)
        displayName = formatFormulaHTML(input);
    }

    // Step 6: Render HTML Output
    outputContent.innerHTML = `
        <div class="result-header">
            <div class="chem-name-display">${displayName}</div>
            <div class="chem-stats">
                ${totalAtoms} Atom${totalAtoms > 1 ? 's' : ''}<br>
                Particle Type: ${particleType}
            </div>
        </div>
        
        <div class="molar-mass-title">Molar Mass:</div>
        <ul class="mass-breakdown">
            ${breakdownHTML}
        </ul>
        
        <div class="total-mass-display">
            ${totalMass.toFixed(2)} g/mol
        </div>
    `;
}

// --- 5. HELPER FUNCTIONS ---

// Parses formulas like Cr2(SO4)3 into {Cr: 2, S: 3, O: 12} using a stack
function parseChemicalFormula(formula) {
    const stack = [{}];
    let i = 0;

    while (i < formula.length) {
        const char = formula[i];

        if (char === '(') {
            stack.push({});
            i++;
        } else if (char === ')') {
            i++;
            let mult = '';
            while (i < formula.length && /[0-9]/.test(formula[i])) {
                mult += formula[i];
                i++;
            }
            mult = mult ? parseInt(mult, 10) : 1;
            
            const top = stack.pop();
            const currentObj = stack[stack.length - 1];
            
            for (const [el, count] of Object.entries(top)) {
                currentObj[el] = (currentObj[el] || 0) + (count * mult);
            }
        } else {
            // Match an Element (capital letter followed by optional lowercase) and its number
            const match = formula.substring(i).match(/^([A-Z][a-z]*)([0-9]*)/);
            if (match) {
                const el = match[1];
                const count = match[2] ? parseInt(match[2], 10) : 1;
                const currentObj = stack[stack.length - 1];
                currentObj[el] = (currentObj[el] || 0) + count;
                i += match[0].length;
            } else {
                // Invalid character, break out to prevent infinite loop
                return null; 
            }
        }
    }
    return stack[0];
}

// Turns C_4H_9O_2 or C4H9O2 into nicely formatted HTML with <sub> tags
function formatFormulaHTML(rawInput) {
    // If the user used underscores, replace _NUMBER with <sub>NUMBER</sub>
    if (rawInput.includes('_')) {
        return rawInput.replace(/_(\d+)/g, '<sub>$1</sub>');
    }
    // Otherwise automatically convert numbers to subscripts
    return rawInput.replace(/(\d+)/g, '<sub>$1</sub>');
}s
