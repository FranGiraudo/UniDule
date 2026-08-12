const fs = require('fs');
const lines = fs.readFileSync('src/views/career.js', 'utf8').split('\n');

// We need to extract lines that define CM, renderCareerMap, cmApplyTransform, cmZoom, cmReset, setupCmPanZoom, handleCareerNodeClick, clearCmHighlight
// Let's find their indices.

let outMap = `import { S, selectedCareerNode, setSelectedCareerNode } from '../core/state.js';
import { CAREER_STATUS_CFG } from '../core/constants.js';
import { getComputedStatus, openCareerSubDetail } from './career.js';

const CM = { NW:148, NH:44, HGAP:36, VGAP:12, HEADER:66, M:16 };
let _cmT = {x:0,y:0,s:0.72};

`;

let startIdx = lines.findIndex(l => l.includes('function renderCareerMap() {'));
let endIdx = lines.findIndex(l => l.includes('function renderCareerFinals() {')) - 4;

const mapLines = lines.slice(startIdx, endIdx).join('\n');
outMap += mapLines;
outMap += `\n\nwindow.cmZoom = cmZoom;\nwindow.cmReset = cmReset;\nwindow.handleCareerNodeClick = handleCareerNodeClick;\n`;

fs.writeFileSync('src/views/careerMap.js', outMap);

// Remove them from career.js
const careerTop = lines.slice(0, startIdx - 5);
const careerBottom = lines.slice(endIdx);
let newCareer = careerTop.join('\n') + '\n\n' + careerBottom.join('\n');

// Add export to getComputedStatus and openCareerSubDetail
newCareer = newCareer.replace(/function getComputedStatus/g, 'export function getComputedStatus');
newCareer = newCareer.replace(/function openCareerSubDetail/g, 'export function openCareerSubDetail');

fs.writeFileSync('src/views/career.js', newCareer);
console.log('careerMap.js created and career.js updated.');
