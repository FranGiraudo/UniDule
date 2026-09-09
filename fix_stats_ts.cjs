const fs = require('fs');
let content = fs.readFileSync('src/pages/Stats.tsx', 'utf8');

content = content.replace(
  "import { Activity, BookOpen, Dumbbell, Flame } from 'lucide-react';",
  "import { Activity, BookOpen, Dumbbell } from 'lucide-react';"
);

content = content.replace(
  "{Object.entries(studyBySubject).sort((a,b) => b[1] - a[1]).map(([subId, mins]) => {",
  "{Object.entries(studyBySubject).sort((a: any, b: any) => b[1] - a[1]).map(([subId, mins]: [string, any]) => {"
);

fs.writeFileSync('src/pages/Stats.tsx', content);
