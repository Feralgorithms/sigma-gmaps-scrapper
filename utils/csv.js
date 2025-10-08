const fs = require('fs');

function saveToCSV(data, filename){
  if(!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(d=>Object.values(d).map(v=>`"${v||''}"`).join(',')).join('\n');
  fs.writeFileSync(filename,[headers,rows].join('\n'),'utf-8');
}

module.exports = { saveToCSV };
