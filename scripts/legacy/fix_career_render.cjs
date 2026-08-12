const fs = require('fs');

const fixedContent = `
        <button class="career-tab" data-tab="map" onclick="setCareerTab('map')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>Mapa
        </button>
      </div>
      <div id="career-grid-container"></div>
      <div id="career-map-container"       style="display:none;"></div>
      <div id="career-seminars-container"  style="display:none;"></div>
      <div id="career-electives-container" style="display:none;"></div>
      <div id="career-finals-container"    style="display:none;"></div>
      <div id="career-stats-container"     style="display:none;"></div>
    \`;
  }

  if      (activeCareerTab === 'grid')      renderCareerGrid();
  else if (activeCareerTab === 'map')       renderCareerMap();
  else if (activeCareerTab === 'seminars')  renderCareerSeminars();
  else if (activeCareerTab === 'electives') renderCareerElectives();
  else if (activeCareerTab === 'finals')    renderCareerFinals();
  else                                      renderCareerStats();
}

window.setCareerTab = function(tab) {
`;

let careerStr = fs.readFileSync('src/views/career.js', 'utf8');

// The file currently has:
/*
        <button class="career-tab" data-tab="map" onclick="setCareerTab('map')">
  setActiveCareerTab(tab);
*/

const searchStr = `        <button class="career-tab" data-tab="map" onclick="setCareerTab('map')">
  setActiveCareerTab(tab);`;

careerStr = careerStr.replace(searchStr, fixedContent + '  setActiveCareerTab(tab);');

fs.writeFileSync('src/views/career.js', careerStr);
console.log('Fixed career.js');
