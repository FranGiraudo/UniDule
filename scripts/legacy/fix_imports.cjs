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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replacements for state vars:
  // currentView = v -> setCurrentView(v)
  // sbOpen = v -> setSbOpen(v)
  // taskFilter = v -> setTaskFilter(v)
  // selColor = v -> setSelColor(v)
  // slots = v -> setSlots(v)
  // activeDay = v -> setActiveDay(v)
  // gradesWork = v -> setGradesWork(v)
  // gradesSubId = v -> setGradesSubId(v)
  // deferredPrompt = v -> setDeferredPrompt(v)
  // activeCareerTab = v -> setActiveCareerTab(v)
  // selectedCareerNode = v -> setSelectedCareerNode(v)
  // careerGridFilter = v -> setCareerGridFilterVal(v)
  // careerGridSearch = v -> setCareerGridSearchVal(v)

  const patterns = [
    { regex: /\bcurrentView\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setCurrentView($1)$2' },
    { regex: /\btaskFilter\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setTaskFilter($1)$2' },
    { regex: /\bselColor\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setSelColor($1)$2' },
    { regex: /\bslots\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setSlots($1)$2' },
    { regex: /\bactiveDay\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setActiveDay($1)$2' },
    { regex: /\bgradesWork\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setGradesWork($1)$2' },
    { regex: /\bgradesSubId\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setGradesSubId($1)$2' },
    { regex: /\bdeferredPrompt\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setDeferredPrompt($1)$2' },
    { regex: /\bactiveCareerTab\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setActiveCareerTab($1)$2' },
    { regex: /\bselectedCareerNode\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setSelectedCareerNode($1)$2' },
    { regex: /\bcareerGridFilter\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setCareerGridFilterVal($1)$2' },
    { regex: /\bcareerGridSearch\s*=\s*(.+?)(;|\n| \n)/g, replace: 'setCareerGridSearchVal($1)$2' },
  ];

  // Specific case: sbOpen = !sbOpen
  content = content.replace(/\bsbOpen\s*=\s*!sbOpen/g, () => {
    changed = true;
    return 'setSbOpen(!sbOpen)';
  });
  
  // Specific case: slots.push(...) -> slots array is mutable in memory, but if reassigned:
  // wait, slots = []
  
  patterns.forEach(p => {
    content = content.replace(p.regex, (match, p1, p2) => {
      changed = true;
      return p.replace.replace('$1', p1).replace('$2', p2);
    });
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
