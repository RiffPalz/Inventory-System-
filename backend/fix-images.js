import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize('axistech', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

async function fixProductImages() {
    try {
        // Get all products
        const [products] = await sequelize.query('SELECT ID, name, images FROM products');

        const uploadsDir = path.join(__dirname, 'uploads');
        const existingFiles = fs.readdirSync(uploadsDir);

        console.log(`Found ${existingFiles.length} files in uploads directory`);
        console.log(`Checking ${products.length} products...`);

        for (const product of products) {
            if (!product.images) {
                console.log(`Product ${product.ID} (${product.name}): No images`);
                continue;
            }

            let images = [];
            try {
                images = JSON.parse(product.images);
            } catch (e) {
                console.log(`Product ${product.ID} (${product.name}): Invalid JSON, clearing`);
                await sequelize.query('UPDATE products SET images = NULL WHERE ID = ?', {
                    replacements: [product.ID]
                });
                continue;
            }

            if (!Array.isArray(images) || images.length === 0) {
                console.log(`Product ${product.ID} (${product.name}): Empty images array`);
                continue;
            }

            // Check if image files exist
            const validImages = images.filter(img => {
                const filename = img.replace('/uploads/', '');
                const exists = existingFiles.includes(filename);
                if (!exists) {
                    console.log(`  ❌ ${filename} - NOT FOUND`);
                } else {
                    console.log(`  ✓ ${filename} - OK`);
                }
                return exists;
            });

            if (validImages.length !== images.length) {
                if (validImages.length === 0) {
                    console.log(`Product ${product.ID} (${product.name}): All images broken, clearing`);
                    await sequelize.query('UPDATE products SET images = NULL WHERE ID = ?', {
                        replacements: [product.ID]
                    });
                } else {
                    console.log(`Product ${product.ID} (${product.name}): Updating to ${validImages.length} valid images`);
                    await sequelize.query('UPDATE products SET images = ? WHERE ID = ?', {
                        replacements: [JSON.stringify(validImages), product.ID]
                    });
                }
            } else {
                console.log(`Product ${product.ID} (${product.name}): All images OK`);
            }
        }

        console.log('\n✅ Done!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixProductImages();
