const { initDatabase, prepare } = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  await initDatabase();
  console.log('🌱 Seeding database...\n');

  const adminPassword = bcrypt.hashSync('ShubhaM@12345', 10);
  try { prepare('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)').run('Shubham Singh', 'shubhamkhushwaha300@gmail.com', adminPassword, 'admin'); } catch(e) {}

  const userPassword = bcrypt.hashSync('user123', 10);
  try { prepare('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)').run('John Doe', 'john@example.com', userPassword, 'customer'); } catch(e) {}

  console.log('✅ Users created');
  console.log('   Admin: shubhamkhushwaha300@gmail.com / ShubhaM@12345');
  console.log('   User:  john@example.com / user123\n');

  const categories = [
    ['Electronics','electronics','Latest gadgets and tech','https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600'],
    ['Clothing','clothing','Trendy fashion','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'],
    ['Home & Living','home-living','Furniture and decor','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'],
    ['Sports','sports','Equipment and activewear','https://images.unsplash.com/photo-1461896836934-bd45ba76023e?w=600'],
    ['Beauty','beauty','Skincare and fragrances','https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600'],
    ['Books','books','Bestsellers and classics','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'],
  ];
  categories.forEach(c => { try { prepare('INSERT INTO categories (name,slug,description,image) VALUES (?,?,?,?)').run(...c); } catch(e) {} });
  console.log('✅ Categories created\n');

  // Prices in INR (₹)
  const products = [
    ['MacBook Pro 16"','macbook-pro-16','Apple M3 Pro chip, 18GB RAM, 512GB SSD.',199999,137999,1,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',25,4.8,124,1,'["laptop","apple"]'],
    ['Sony WH-1000XM5','sony-wh-1000xm5','Industry-leading noise canceling headphones.',28999,20999,1,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',50,4.7,89,1,'["headphones","audio"]'],
    ['iPhone 16 Pro','iphone-16-pro','A18 Pro chip, 48MP camera system.',134900,0,1,'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',40,4.9,256,1,'["phone","apple"]'],
    ['Samsung 4K Smart TV 65"','samsung-4k-tv-65','Crystal clear 4K resolution.',64999,50999,1,'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',15,4.5,67,0,'["tv","samsung"]'],
    ['iPad Air M2','ipad-air-m2','M2 chip, 11-inch Liquid Retina display.',49999,32999,1,'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',35,4.6,45,0,'["tablet","apple"]'],
    ['Premium Leather Jacket','premium-leather-jacket','Handcrafted genuine leather jacket.',24999,22499,1,'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600',20,4.6,34,1,'["jacket","leather"]'],
    ['Designer Silk Dress','designer-silk-dress','Elegant silk dress with flowing design.',15999,12599,1,'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',30,4.4,22,0,'["dress","silk"]'],
    ['Classic Denim Jeans','classic-denim-jeans','Premium denim with perfect fit.',6499,5099,1,'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',60,4.3,88,0,'["jeans","denim"]'],
    ['Cashmere Sweater','cashmere-sweater','Ultra-soft 100% cashmere sweater.',12999,10199,1,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',25,4.7,41,1,'["sweater","cashmere"]'],
    ['Scandinavian Sofa Set','scandinavian-sofa-set','Minimalist 3-seater sofa.',107999,79799,2,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',8,4.8,19,1,'["sofa","furniture"]'],
    ['Smart LED Floor Lamp','smart-led-floor-lamp','WiFi-enabled with 16 million colors.',12499,10199,2,'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600',22,4.4,35,0,'["lamp","smart home"]'],
    ['Carbon Fiber Road Bike','carbon-fiber-road-bike','Ultra-lightweight carbon frame.',157999,109799,2,'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600',10,4.9,12,1,'["bike","cycling"]'],
    ['Running Shoes Ultra','running-shoes-ultra','Responsive cushioning for runners.',14999,11099,2,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',45,4.7,156,1,'["shoes","running"]'],
    ['Luxury Skincare Set','luxury-skincare-set','Complete skincare routine set.',10799,8999,3,'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600',30,4.5,48,1,'["skincare","beauty"]'],
    ['Artisan Perfume Collection','artisan-perfume-collection','Set of 4 handcrafted fragrances.',16599,13979,3,'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',20,4.8,31,0,'["perfume","luxury"]'],
    ['The Art of Innovation','the-art-of-innovation','Groundbreaking book on creative thinking.',1999,1739,4,'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',100,4.4,89,0,'["business","bestseller"]'],
    ["Collector's Book Set",'collectors-book-set','Gold-embossed hardcover classics.',7499,5999,4,'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',15,4.9,14,1,'["books","collection"]'],
    ['Rolex Submariner Replica','rolex-submariner','High-quality automatic watch.',15999,11999,1,'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600',5,4.6,88,1,'["watch","luxury"]'],
    ['DJI Mini 4 Pro','dji-mini-4-pro','Compact lightweight drone with 4K HDR video.',65000,43200,1,'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600',12,4.8,102,1,'["drone","camera"]'],
    ['Minimalist Desk Setup','minimalist-desk-setup','Oak wood standing desk and ergonomic chair.',85999,66000,2,'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',10,4.5,45,0,'["desk","furniture"]'],
    ['Coffee Espresso Machine','coffee-espresso','Barista-grade espresso machine for home.',45999,33000,2,'https://images.unsplash.com/photo-1517246281081-424aedb85bc8?w=600',8,4.7,60,1,'["coffee","kitchen"]'],
    ['Yoga Mat Pro','yoga-mat-pro','Eco-friendly premium non-slip yoga mat.',3999,3299,2,'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600',100,4.6,330,0,'["yoga","fitness"]'],
  ];

  products.forEach(p => {
    try {
      prepare('INSERT INTO products (name,slug,description,price,compare_price,category_id,image,stock,rating,review_count,featured,tags) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(...p);
    } catch(e) {}
  });

  console.log(`✅ ${products.length} products created (prices in ₹ INR)\n`);
  console.log('🎉 Database seeded successfully!\n');
}

seed().catch(console.error);
