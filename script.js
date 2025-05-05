// Function to parse CSV content with handling for quoted fields
function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
        console.error("CSV file is empty or only contains headers.");
        return [];
    }
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const result = [];
    const expectedColumns = headers.length;

    if (!headers.includes("type") || !headers.includes("part") || !headers.includes("term") || !headers.includes("definition")) {
        console.error("CSV file is missing required headers (type, part, term, definition).");
        alert("CSV file is missing required headers (type, part, term, definition).");
        return [];
    }

    const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g;

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].trim();
        if (!currentLine) continue;

        let columns = [];
        let match;
        regex.lastIndex = 0; // Reset regex index for each line

        while ((match = regex.exec(currentLine))) {
            let value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
            columns.push((value || "").trim());
            if (match[0].endsWith(",")) continue;
            if (match[0] === "" && regex.lastIndex === currentLine.length) break;
            if (regex.lastIndex === currentLine.length) break;
        }
        if (columns.length > expectedColumns && columns[columns.length - 1] === "") {
             columns.pop();
        }

        if (columns.length === expectedColumns) {
            const entry = {};
            let validEntry = true;
            headers.forEach((header, index) => {
                const value = columns[index];
                if ((header === "type" || header === "part" || header === "term") && !value) {
                    validEntry = false;
                }
                entry[header] = value;
            });

            if (validEntry && entry.type) {
                 entry.type = entry.type.toLowerCase();
                 if (!entry.type) {
                     validEntry = false;
                 }
            } else if (validEntry && !entry.type) {
                 validEntry = false;
            }

            if (validEntry) {
                const validParts = ["prefix", "root", "suffix"];
                if (!entry.part || !validParts.includes(entry.part.toLowerCase())) {
                     validEntry = false;
                } else {
                    entry.part = entry.part.toLowerCase();
                }
            }

            if (validEntry) {
                 if (!entry.term) {
                     validEntry = false;
                 }
            }

            if (validEntry) {
                result.push(entry);
            }
        } else {
             if (currentLine.trim()) {
             }
        }
    }
    console.log(`Successfully parsed ${result.length} valid entries from CSV.`);
    return result;
}

// Themes object (will be populated dynamically from CSV)
const themes = {};
let themesLoadedPromise = null; // Promise to track theme loading

// Function to load and organize data from word_parts.csv
async function loadWordParts() {
    if (themesLoadedPromise) {
        console.log("Theme loading already in progress or completed.");
        return themesLoadedPromise;
    }

    themesLoadedPromise = new Promise(async (resolve, reject) => {
        const loadingElement = document.getElementById("loading");
        if (loadingElement) loadingElement.classList.remove("hidden");

        try {
            console.log("Fetching word_parts.csv...");
            const response = await fetch("data/word_parts.csv");
            console.log("Fetch Response Status:", response.status);
            if (!response.ok) {
                throw new Error(`Failed to load word_parts.csv: ${response.status} ${response.statusText}`);
            }
            const csvText = await response.text();
            const data = parseCSV(csvText);
            console.log(`Parsed ${data.length} valid entries from CSV.`);

            for (const key in themes) {
                delete themes[key];
            }

            data.forEach(({ type, part, term, definition }) => {
                if (!themes[type]) {
                    themes[type] = { prefixes: [], prefixDefs: [], roots: [], rootDefs: [], suffixes: [], suffixDefs: [] };
                }
                let cleanedTerm = term;
                if (part === "prefix") {
                    cleanedTerm = term.replace(/-+$/, "");
                } else if (part === "suffix") {
                    cleanedTerm = term.replace(/^-+/, "");
                }
                if (cleanedTerm) {
                    if (part === "prefix") {
                        themes[type].prefixes.push(cleanedTerm);
                        themes[type].prefixDefs.push(definition || "");
                    } else if (part === "root") {
                        themes[type].roots.push(cleanedTerm);
                        themes[type].rootDefs.push(definition || "");
                    } else if (part === "suffix") {
                        themes[type].suffixes.push(cleanedTerm);
                        themes[type].suffixDefs.push(definition || "");
                    }
                }
            });

            console.log("Populated themes:", Object.keys(themes));
            Object.keys(themes).forEach(theme => {
                const themeData = themes[theme];
                if (!themeData.prefixes.length || !themeData.roots.length || !themeData.suffixes.length) {
                    console.warn(`Theme '${theme}' is missing some word parts (prefixes, roots, or suffixes). Word generation for this theme might fail.`);
                }
            });

            console.log("Dispatching themesLoaded event...");
            document.dispatchEvent(new CustomEvent('themesLoaded')); // Dispatch event
            resolve(themes); // Resolve the promise with the loaded themes

        } catch (error) {
            console.error("Error loading or processing word parts:", error);
            alert("Failed to load word parts data. Please check the console and ensure data/word_parts.csv is accessible and correctly formatted.");
            reject(error); // Reject the promise on error
        } finally {
            if (loadingElement) loadingElement.classList.add("hidden");
        }
    });

    return themesLoadedPromise;
}

// Function to populate theme dropdown dynamically (used by both index.html and game.html)
function populateThemeDropdown() {
    let themeDropdown = document.getElementById("themeType") || document.getElementById("gameThemeType");

    if (!themeDropdown) {
        console.error("Theme dropdown element not found on this page!");
        return;
    }

    const currentSelectedValue = themeDropdown.value;
    themeDropdown.innerHTML = ''; // Clear existing options

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.text = "All";
    themeDropdown.appendChild(allOption);

    const sortedThemes = Object.keys(themes).sort();
    console.log("Themes to populate dropdown:", ["All", ...sortedThemes]);
    sortedThemes.forEach((themeKey) => {
        const themeData = themes[themeKey];
        if (themeData && themeData.prefixes.length > 0 && themeData.roots.length > 0 && themeData.suffixes.length > 0) {
            const option = document.createElement("option");
            option.value = themeKey;
            option.text = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
            themeDropdown.appendChild(option);
        } else {
            console.warn(`Theme '${themeKey}' not added to dropdown because it lacks sufficient parts.`);
        }
    });

    // Try to restore the previous selection, otherwise default to 'all'
    if (currentSelectedValue && themeDropdown.querySelector(`option[value="${currentSelectedValue}"]`)) {
        themeDropdown.value = currentSelectedValue;
    } else {
        themeDropdown.value = "all";
    }
    console.log(`Theme dropdown populated. Current value: ${themeDropdown.value}`);
}

// Get a random element from an array
function getRandomElement(arr) {
    if (!arr || arr.length === 0) return { element: null, index: -1 };
    const index = Math.floor(Math.random() * arr.length);
    return { element: arr[index], index: index };
}

// Generate word and definition based on selected types
function generateWordAndDefinition(wordType, themeKey, options = { removeHyphens: false }) {
    let prefix = '', root1 = '', root2 = '', suffix = '';
    let prefixDef = '', rootDef1 = '', rootDef2 = '', suffixDef = '';
    let prefixIndex = -1, root1Index = -1, root2Index = -1, suffixIndex = -1;

    const allPrefixes = [], allPrefixDefs = [];
    const allRoots = [], allRootDefs = [];
    const allSuffixes = [], allSuffixDefs = [];

    if (themeKey === 'all') {
        Object.values(themes).forEach(themeData => {
            allPrefixes.push(...themeData.prefixes);
            allPrefixDefs.push(...themeData.prefixDefs);
            allRoots.push(...themeData.roots);
            allRootDefs.push(...themeData.rootDefs);
            allSuffixes.push(...themeData.suffixes);
            allSuffixDefs.push(...themeData.suffixDefs);
        });
        if (allPrefixes.length === 0 || allRoots.length === 0 || allSuffixes.length === 0) {
            console.error("Cannot generate word for 'All' theme: Insufficient parts across all themes.");
            return { word: "Error", definition: "Insufficient parts for 'All' theme.", pronunciation: "" };
        }
    } else {
        if (!themes[themeKey] || !themes[themeKey].prefixes.length || !themes[themeKey].roots.length || !themes[themeKey].suffixes.length) {
            console.error(`Selected theme '${themeKey}' not found or has insufficient parts.`);
            if (themes['normal'] && themes['normal'].prefixes.length && themes['normal'].roots.length && themes['normal'].suffixes.length) {
                console.warn(`Defaulting to 'normal' theme.`);
                themeKey = 'normal';
            } else {
                 return { word: "Error", definition: `Theme '${themeKey}' has missing parts.`, pronunciation: "" };
            }
        }
    }

    const getParts = (partType) => {
        const source = themeKey === 'all' ? { prefixes: allPrefixes, prefixDefs: allPrefixDefs, roots: allRoots, rootDefs: allRootDefs, suffixes: allSuffixes, suffixDefs: allSuffixDefs } : themes[themeKey];
        switch (partType) {
            case 'prefix': return { elements: source.prefixes, defs: source.prefixDefs };
            case 'root': return { elements: source.roots, defs: source.rootDefs };
            case 'suffix': return { elements: source.suffixes, defs: source.suffixDefs };
            default: return { elements: [], defs: [] };
        }
    };

    if (wordType === 'pre-root-suf' || wordType === 'pre-root') {
        const { elements, defs } = getParts('prefix');
        const result = getRandomElement(elements);
        prefix = result.element;
        prefixIndex = result.index;
        prefixDef = defs[prefixIndex] || '';
    }
    if (wordType.includes('root')) {
        const { elements, defs } = getParts('root');
        const result1 = getRandomElement(elements);
        root1 = result1.element;
        root1Index = result1.index;
        rootDef1 = defs[root1Index] || '';

        if (wordType === 'pre-root-root-suf' || wordType === 'root-root' || wordType === 'pre-root-root') {
            const result2 = getRandomElement(elements);
            root2 = result2.element;
            root2Index = result2.index;
            rootDef2 = defs[root2Index] || '';
        }
    }
    if (wordType.endsWith('suf')) {
        const { elements, defs } = getParts('suffix');
        const result = getRandomElement(elements);
        suffix = result.element;
        suffixIndex = result.index;
        suffixDef = defs[suffixIndex] || '';
    }

    const parts = [prefix, root1, root2, suffix].filter(part => part && part.trim() !== '');
    let word = options.removeHyphens ? parts.join('') : parts.join('-');
    if (!options.removeHyphens) {
        word = word.replace(/--+/g, '-'); // Clean up double hyphens only if hyphenated
    }

    const definition = generateSentenceDefinition(wordType, prefixDef, rootDef1, rootDef2, suffixDef, suffixIndex, themeKey === 'all' ? 'normal' : themeKey);
    const pronunciation = generatePronunciation(word, options.removeHyphens);

    return { word, definition, pronunciation };
}

// Simplified pronunciation generator
function generatePronunciation(word, removeHyphens = false) {
    if (removeHyphens) {
        return `/${word}/`; // Simplified pronunciation for unhyphenated words
    }
    return `/${word.replace(/-/g, ' / ')}/`;
}

// Determine part of speech (basic placeholder)
function getPartOfSpeech(type, suffixIndex, theme) {
    if (type.endsWith('suf') && suffixIndex !== -1) {
        let suffix = '';
        const source = theme === 'all' ? null : themes[theme]; // Cannot reliably get suffix for 'all'
        if (source && source.suffixes.length > suffixIndex) {
            suffix = source.suffixes[suffixIndex];
        }

        if (['ly', 'th'].includes(suffix)) return 'adverb';
        if (['ize', 'ify', 'en', 'ate'].includes(suffix)) return 'verb';
        if (['ous', 'al', 'an', 'ile', 'ic', 'esque', 'ful', 'ious', 'ar', 'able', 'ible', 'ish', 'ive', 'less', 'some', 'y'].includes(suffix)) return 'adjective';
        if (['ics', 'ism', 'ist', 'ity', 'ty', 'ment', 'ness', 'ion', 'tion', 'sion', 'ship', 'dom', 'hood', 'logy', 'ology', 'phobia', 'philia', 'er', 'or', 'ant', 'ent', 'ard', 'ry', 'cy', 'tude'].includes(suffix)) return 'noun';
    }
    // Default or if no suffix/match
    return 'noun';
}

// Enhanced definition generator (simplified version)
function generateSentenceDefinition(type, preDef, rootDef1, rootDef2, sufDef, suffixIndex, theme) {
    let definition = '';
    const partOfSpeech = getPartOfSpeech(type, suffixIndex, theme);
    const partsDefs = [preDef, rootDef1, rootDef2, sufDef].filter(def => def && def.trim() !== '');

    definition = `(${partOfSpeech}) `;

    if (partsDefs.length === 0) {
        definition += "A generated word.";
    } else if (partsDefs.length === 1) {
        definition += `Related to ${partsDefs[0]}.`;
    } else {
        let combined = partsDefs[0];
        for (let i = 1; i < partsDefs.length; i++) {
            combined += (i === partsDefs.length - 1 ? ' and ' : ', ') + partsDefs[i];
        }
        definition += `Pertaining to ${combined}.`;
    }

    // Capitalize first letter of the main definition part
    const firstCharIndex = definition.indexOf(')') + 2;
    if (firstCharIndex < definition.length) {
       definition = definition.substring(0, firstCharIndex) + definition.charAt(firstCharIndex).toUpperCase() + definition.slice(firstCharIndex + 1);
    }

    return definition;
}

// Function to update the display with the generated word (for index.html)
function updateDisplay() {
    const generatedWordEl = document.getElementById('generatedWord');
    const pronunciationEl = document.getElementById('pronunciation');
    const wordDefinitionEl = document.getElementById('wordDefinition');
    const permutationType = document.getElementById('permutationType');
    const themeType = document.getElementById("themeType");

    // Ensure elements exist before proceeding (only run if on index.html)
    if (!permutationType || !themeType || !generatedWordEl || !pronunciationEl || !wordDefinitionEl) {
        return;
    }

    const selectedWordType = permutationType.value;
    const selectedTheme = themeType.value;

    console.log(`Generating word for index.html - type: ${selectedWordType}, theme: ${selectedTheme}`);

    if (Object.keys(themes).length === 0 && selectedTheme !== 'all') {
        console.warn("Themes not loaded yet for index.html.");
        generatedWordEl.textContent = "Loading...";
        pronunciationEl.textContent = "";
        wordDefinitionEl.textContent = "Please wait for data to load.";
        return;
    }

    const { word, definition, pronunciation } = generateWordAndDefinition(selectedWordType, selectedTheme);

    generatedWordEl.textContent = word;
    pronunciationEl.textContent = pronunciation;
    wordDefinitionEl.textContent = definition;
}

// Function to copy word and definition to clipboard (for index.html)
function copyToClipboard() {
    const generatedWord = document.getElementById('generatedWord')?.textContent || '';
    const wordDefinition = document.getElementById('wordDefinition')?.textContent || '';
    if (!generatedWord) {
        console.warn("No word generated to copy.");
        return;
    }
    const textToCopy = `Word: ${generatedWord}\nDefinition: ${wordDefinition}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const copyButton = document.getElementById('copyButton');
        if (copyButton) {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text.');
    });
}

// --- Initialization --- //

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed");

    // Start loading themes immediately and wait for it to complete
    try {
        await loadWordParts();
    } catch (error) {
        console.error("Failed to initialize due to theme loading error:", error);
        return; // Stop initialization if themes failed to load
    }

    // Now that themes are loaded, check which page we are on and initialize accordingly

    // Check for index.html elements
    const generateButton = document.getElementById("generateButton");
    const copyButton = document.getElementById("copyButton");
    const permutationType = document.getElementById("permutationType");
    const themeType = document.getElementById("themeType");

    if (generateButton && copyButton && permutationType && themeType) {
        console.log("Initializing index.html UI...");
        // Setup listeners for index.html elements
        generateButton.addEventListener("click", updateDisplay);
        copyButton.addEventListener("click", copyToClipboard);
        permutationType.addEventListener("change", updateDisplay);
        themeType.addEventListener("change", updateDisplay);

        populateThemeDropdown(); // Populates #themeType
        updateDisplay(); // Initial word generation for index.html
    } else {
        console.log("Not on index.html or missing elements, skipping index.html UI initialization.");
        // Game page initialization is handled by game.js, which listens for 'themesLoaded'
        // No need to explicitly check for game.html here, as game.js handles its own setup.
    }
});