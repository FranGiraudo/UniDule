const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');

const setters = [
  { set: 'setCurrentView', v: 'currentView' },
  { set: 'setTaskFilter', v: 'taskFilter' },
  { set: 'setSelColor', v: 'selColor' },
  { set: 'setSlots', v: 'slots' },
  { set: 'setActiveDay', v: 'activeDay' },
  { set: 'setGradesWork', v: 'gradesWork' },
  { set: 'setGradesSubId', v: 'gradesSubId' },
  { set: 'setDeferredPrompt', v: 'deferredPrompt' },
  { set: 'setActiveCareerTab', v: 'activeCareerTab' },
  { set: 'setSelectedCareerNode', v: 'selectedCareerNode' },
  { set: 'setCareerGridFilterVal', v: 'careerGridFilter' },
  { set: 'setCareerGridSearchVal', v: 'careerGridSearch' },
  { set: 'setSbOpen', v: 'sbOpen' }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  setters.forEach(({ set, v }) => {
    // Undo: export let set( == '...') -> export let v = '...'
    const reExport = new RegExp(`export let ${set}\\((.*?)\\);`, 'g');
    content = content.replace(reExport, (match, val) => {
      changed = true;
      return `export let ${v} = ${val};`;
    });

    // Undo: set(=='...') -> v === '...'
    const reEqEq = new RegExp(`${set}\\(==(.*?)(\\)|;)`, 'g');
    content = content.replace(reEqEq, (match, val, end) => {
      changed = true;
      // It was probably set(=='val') which came from v === 'val'
      // The original was v === val
      // Wait, if it was `if (currentView === 'dashboard')`, the regex matched `currentView === 'dashboard'`
      // and replaced with `setCurrentView(=='dashboard')`
      // So val is `'dashboard'` and end is `)`
      return `${v} === ${val}${end === ';' ? '' : ''}`;
    });

    // Undo: set(=...) -> v == ...
    const reEq = new RegExp(`${set}\\(=(.*?)(\\)|;)`, 'g');
    content = content.replace(reEq, (match, val, end) => {
      changed = true;
      return `${v} == ${val}`;
    });
    
    // What if `currentView !==` ? The regex `\bcurrentView\s*=\s*` wouldn't match `!==`. It only matches `=`.
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed back', file);
  }
});
