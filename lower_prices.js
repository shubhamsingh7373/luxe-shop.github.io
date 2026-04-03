const fs = require('fs');
const seedStr = fs.readFileSync('seed.js', 'utf8');

// Regex logic: find arrays like ['Name', 'slug', 'desc', 199999, 229999, ... ] and reduce the numbers
const updated = seedStr.replace(/(\[.*?,\d+,.*?)(\d+),(\d+),(.*\])/g, (match, prefix, price, compare, suffix) => {
  const newPrice = Math.round(Number(price) * 0.6); // 40% discount
  const newCompare = Math.round(Number(compare) * 0.6);
  return `${prefix}${newPrice},${newCompare},${suffix}`;
});

fs.writeFileSync('seed.js', updated);

// also apply to current db just in case
const { initDatabase, prepare } = require('./database');
async function run() {
  await initDatabase();
  prepare('UPDATE products SET price = ROUND(price * 0.6), compare_price = ROUND(compare_price * 0.6)').run();
  console.log("Prices lowered successfully!");
}
run();
