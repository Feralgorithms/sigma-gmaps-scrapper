const fs = require('fs');
const { percent } = require('./stats');

function saveReport(query,data,filename){
  const report=[];
  report.push('='.repeat(80));
  report.push('LAPORAN GOOGLE MAPS SCRAPING');
  report.push('='.repeat(80));
  report.push(`Query: ${query}`);
  report.push(`Tanggal: ${new Date().toLocaleString('id-ID')}`);
  report.push(`Total Hasil: ${data.length}\n`);
  report.push('KUALITAS DATA : ');
  report.push('-'.repeat(80));
  report.push(`✓ Kordinat: ${data.filter(r=>r.latitude).length}/${data.length} (${percent(data,r=>r.latitude)}%)`);
  report.push(`✓ Rating: ${data.filter(r=>r.rating).length}/${data.length} (${percent(data,r=>r.rating)}%)`);
  report.push(`✓ Jumlah Review: ${data.filter(r=>r.reviewCount).length}/${data.length} (${percent(data,r=>r.reviewCount)}%)`);
  report.push(`✓ Kategori: ${data.filter(r=>r.category).length}/${data.length} (${percent(data,r=>r.category)}%)`);
  report.push(`✓ Deskripsi: ${data.filter(r=>r.description && r.description.length>50).length}/${data.length} (${percent(data,r=>r.description && r.description.length>50)}%)`);
  report.push(`✓ Foto: ${data.filter(r=>r.photos.all.length>0).length}/${data.length} (${percent(data,r=>r.photos.all.length>0)}%)`);
  report.push(`✓ Kontak: ${data.filter(r=>r.phone).length}/${data.length} (${percent(data,r=>r.phone)}%)`);
  report.push(`✓ Website: ${data.filter(r=>r.website).length}/${data.length} (${percent(data,r=>r.website)}%)`);
  report.push('\n'+'='.repeat(80));
  fs.writeFileSync(filename,report.join('\n'),'utf-8');
}

module.exports = { saveReport };