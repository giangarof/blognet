-- create database
-- DROP DATABASE IF EXISTS blognet;
CREATE DATABASE blognet;

-- -- Switch to the new database
\c blognet;

-- -- Enable pgcrypto extension (needed for crypt and gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -- drop if exists table
DROP TABLE IF EXISTS users CASCADE;

-- create table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (firstname, lastname, username, email, password, is_admin)
VALUES
('Admin', '1', 'admin', 'admin@gmail.com', crypt('12345678', gen_salt('bf')), TRUE),
('Jhon', 'Doe', 'jhond', 'jhon@gmail.com', crypt('12345678', gen_salt('bf')), FALSE),
('Tom', 'Brown', 'tomb', 'tom@gmail.com', crypt('12345678', gen_salt('bf')), FALSE),
('Jack', 'Evans', 'jackv', 'jack@gmail.com', crypt('12345678', gen_salt('bf')), FALSE);

-- Drop posts table if it exists
DROP TABLE IF EXISTS posts CASCADE;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500), -- can store URL or image path
    content TEXT NOT NULL,
    likes INT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Drop posts table if it exists
DROP TABLE IF EXISTS comments CASCADE;

-- Create posts table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- To run 
-- psql -U postgres -f backend/scripts/init.sql

-- requirement: 
-- brew install postgresql