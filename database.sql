CREATE DATABASE IF NOT EXISTS sajabo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sajabo;

CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image LONGTEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(40) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    security_question VARCHAR(255) NOT NULL,
    security_answer VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin: admin@sajabo.com / admin123
-- Security question answer: "blue" (change this after first login!)
INSERT INTO admins (email, password, security_question, security_answer)
SELECT 'admin@sajabo.com',
       '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
       'What is your favorite color?',
       '16477688c0e00699c6cfa4497a3612d7e83c532062b64b250fed8908128ed548'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email='admin@sajabo.com');



CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    address TEXT NOT NULL,
    product VARCHAR(150) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    payment VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    transaction_id VARCHAR(50) NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid',
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    rating INT NOT NULL,
    review_text TEXT NOT NULL,
    review_date VARCHAR(30) NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO products (name, price, category, image, description)
SELECT 'Luxury Ceiling Lamp', 10000, 'Ceiling Lights', 'Ceiling-Lamp-02-430x430.jpg', 'Elegant modern ceiling lamp.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Luxury Ceiling Lamp');

INSERT INTO products (name, price, category, image, description)
SELECT 'Crystal Chandelier', 12000, 'Chandeliers', 'josephine-large-chandelier-chandelier-1190654661.webp', 'Beautiful crystal chandelier for a premium look.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Crystal Chandelier');

INSERT INTO products (name, price, category, image, description)
SELECT 'Dandelion Light', 15000, 'Chandeliers', 'Luxury-Crystal-Dandelion-Chandelier-Light-for-Dining.jpg', 'Stylish dandelion chandelier.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Dandelion Light');

INSERT INTO products (name, price, category, image, description)
SELECT 'Wood Chandelier', 18000, 'Pendant Lights', 'images2.jpeg', 'Warm wooden chandelier for dining spaces.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Wood Chandelier');

INSERT INTO products (name, price, category, image, description)
SELECT 'Modern Ceiling Lamp', 25000, 'Ceiling Lights', 'img3.webp', 'Contemporary ceiling lighting.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Modern Ceiling Lamp');

INSERT INTO products (name, price, category, image, description)
SELECT 'Wood Farmhouse Chandelier', 18000, 'Pendant Lights', 'Oaks-Aura-5-Light-Wood-Farmhouse-Drum-Chandelier-Dining-Room-Adjustable-Height-Pendant-Lighting_f9996005-172e-469f-a4e6-aa7d170120aa.10a6a6854ced491f46acce01c87d3c8f.avif', 'Farmhouse style pendant chandelier.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name='Wood Farmhouse Chandelier');
