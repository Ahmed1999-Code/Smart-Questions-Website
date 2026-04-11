const fs = require('fs');

const win1252 = {
    0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
};

function fixString(s) {
    let bytes = [];
    for(let i=0; i<s.length; i++) {
        let code = s.charCodeAt(i);
        if (win1252[code] !== undefined) {
            bytes.push(win1252[code]);
        } else if (code <= 255) {
            bytes.push(code);
        } else {
            // Already standard unicode inside the string?
            // E.g. english text, or if something was preserved
            let utf8buf = Buffer.from(s[i], 'utf8');
            for(let b of utf8buf) bytes.push(b);
        }
    }
    const buf = Buffer.from(bytes);
    const fixed = buf.toString('utf8');
    // Basic test if it's correct UTF-8 (no replacement chars usually if perfect)
    if (fixed.includes('')) return s; // Failed, fallback to original
    return fixed;
}

let content = fs.readFileSync('adaptive-quiz.html', 'utf8');
let lines = content.split('\n');

let isInsideTarget = false;
let fixedLines = [];
let hasChanges = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Target specific ranges (170-317 has the garbled Arabic arrays)
    if (i >= 169 && i <= 316) {
        let fl = fixString(line);
        if (fl !== line) {
            hasChanges = true;
            fixedLines.push(fl);
        } else {
            fixedLines.push(line);
        }
    } else {
        fixedLines.push(line);
    }
}

if (hasChanges) {
    fs.writeFileSync('adaptive-quiz.html', fixedLines.join('\n'), 'utf8');
    console.log('Fixed adaptive-quiz.html successfully!');
} else {
    console.log('No changes needed or fix failed.');
}
