const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, 'MetapharsicApp.jsx');
const file2 = path.join(__dirname, 'metapharsic-frontend', 'src', 'App.jsx');

let content = fs.readFileSync(file1, 'utf8');

const replacements = {
  // From Deep Ocean -> To "Smooth Eye" (GitHub Dimmed inspired)
  '#0284c7': '#338ba8', // Primary buttons (soft teal)
  '#0ea5e9': '#46b3cf', // Highlights
  '#082f49': '#2d4052', // Nav active bg
  '#38bdf8': '#7dc3db', // Nav active text

  '#040b16': '#22272e', // Main bg (soft dark grey-blue)
  '#02060c': '#1c2128', // Sidebar/TopBar (darker soft grey)
  '#0d1b2a': '#2d333b', // Cards/Cols (surface)
  '#1b2c40': '#444c56', // Borders
  '#3d5a73': '#768390', // Muted text
  '#6586a6': '#909dab', // Secondary text
  '#9ebcd9': '#adbac7', // Light text
  '#e0f2fe': '#cdd9e5', // Primary text
  '#f0f9ff': '#e6edf3'  // Titles
};

for (const [oldColor, newColor] of Object.entries(replacements)) {
  const regex = new RegExp(oldColor, 'g');
  content = content.replace(regex, newColor);
}

fs.writeFileSync(file1, content, 'utf8');
fs.writeFileSync(file2, content, 'utf8');

console.log("Theme updated to Smooth Eye (Dimmed Dark)!");
