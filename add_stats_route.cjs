const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  "import { Study } from './pages/Study';",
  "import { Study } from './pages/Study';\nimport { Stats } from './pages/Stats';"
);
app = app.replace(
  '<Route path="study" element={<Study />} />',
  '<Route path="study" element={<Study />} />\n              <Route path="stats" element={<Stats />} />'
);
fs.writeFileSync('src/App.tsx', app);

let sidebar = fs.readFileSync('src/shared/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  "import { Map, Calendar, Settings, LogOut, LayoutDashboard, Edit, CalendarCheck, Timer } from 'lucide-react';",
  "import { Map, Calendar, Settings, LogOut, LayoutDashboard, Edit, CalendarCheck, Timer, BarChart2 } from 'lucide-react';"
);
sidebar = sidebar.replace(
  '          <div className="nav-label">Estudio</div>\n        </NavLink>',
  '          <div className="nav-label">Estudio</div>\n        </NavLink>\n\n        <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? \'active\' : \'\'}`}>\n          <div className="nav-icon">\n            <BarChart2 size={18} />\n          </div>\n          <div className="nav-label">Estadísticas</div>\n        </NavLink>'
);
fs.writeFileSync('src/shared/components/layout/Sidebar.tsx', sidebar);

let mainlayout = fs.readFileSync('src/shared/components/layout/MainLayout.tsx', 'utf8');
mainlayout = mainlayout.replace(
  "import { LayoutDashboard, Map, Calendar, Settings, Edit, CalendarCheck, Timer } from 'lucide-react';",
  "import { LayoutDashboard, Map, Calendar, Settings, Edit, CalendarCheck, Timer, BarChart2 } from 'lucide-react';"
);
mainlayout = mainlayout.replace(
  '          <div className="bnav-label">Estudio</div>\n        </NavLink>',
  '          <div className="bnav-label">Estudio</div>\n        </NavLink>\n        <NavLink to="/stats" className={({ isActive }) => `bnav-item ${isActive ? \'active\' : \'\'}`}>\n          <div className="bnav-icon">\n            <BarChart2 size={18} />\n          </div>\n          <div className="bnav-label">Stats</div>\n        </NavLink>'
);
fs.writeFileSync('src/shared/components/layout/MainLayout.tsx', mainlayout);
