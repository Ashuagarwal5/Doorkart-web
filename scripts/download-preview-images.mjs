import { writeFile } from 'node:fs/promises';
const photos = {
  notebook: 'photo-1531346878377-a5be20888e57',
  gifts: 'photo-1549465220-1a8b9238cd48',
  toys: 'photo-1558877385-81a1c48abfc4',
  sports: 'photo-1546519638-68e109498ffc',
  decor: 'photo-1485955900006-10f4d324d411',
  watch: 'photo-1523275335684-37898b6baf30',
  mug: 'photo-1514228742587-6b1558fcca3d',
  desk: 'photo-1455390582262-044cdead277a',
};
for (const [name, id] of Object.entries(photos)) {
  try {
    const response = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1100&q=85`, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await writeFile(`public/assets/${name}.jpg`, Buffer.from(await response.arrayBuffer()));
    console.log(`${name}: downloaded`);
  } catch (error) { console.error(`${name}: ${error.message}`); process.exitCode = 1; }
}
