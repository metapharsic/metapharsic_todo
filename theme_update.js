const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, 'MetapharsicApp.jsx');
const file2 = path.join(__dirname, 'metapharsic-frontend', 'src', 'App.jsx');

let content = fs.readFileSync(file1, 'utf8');

const replacements = {
  // Brand Blues -> Metapharsic Cyans
  '#2563eb': '#0284c7', // Primary buttons
  '#3b82f6': '#0ea5e9', // Highlights
  '#1e3a5f': '#082f49', // Nav active bg
  '#60a5fa': '#38bdf8', // Nav active text

  // Greys/Slates -> Deep Ocean Navys
  '#0f172a': '#040b16', // App Bg
  '#0a1628': '#02060c', // Sidebar/TopBar
  '#1e293b': '#0d1b2a', // Cards/Cols
  '#334155': '#1b2c40', // Borders
  '#475569': '#3d5a73', // Muted text
  '#64748b': '#6586a6', // Secondary text
  '#94a3b8': '#9ebcd9', // Light text
  '#e2e8f0': '#e0f2fe', // Primary text
  '#f1f5f9': '#f0f9ff'  // Titles
};

for (const [oldColor, newColor] of Object.entries(replacements)) {
  const regex = new RegExp(oldColor, 'g');
  content = content.replace(regex, newColor);
}

fs.writeFileSync(file1, content, 'utf8');
fs.writeFileSync(file2, content, 'utf8');

console.log("Theme updated to Metapharsic Deep Ocean!");
