//Import the .env file for secrets
require("dotenv").config()

//Initialize the client
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL)

//Declare variable to use UUID and bcrypt
const uuid = require("uuid");
const bcrypt = require("bcrypt");

//function createTables
const createTables = async() => {
    const SQL = /* sql */`
        DROP TABLE IF EXISTS favorites;    
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS products;
        
        CREATE TABLE users(
            id UUID PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        );

        CREATE TABLE products(
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE
        );

        CREATE TABLE favorites(
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES users(id) NOT NULL,
            product_id UUID REFERENCES products(id) NOT NULL,
            CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
        );
    `;

    return await client.query(SQL)
};

//function createUser
const createUser = async({username, password}) => {
    const SQL = `
        INSERT INTO users(id, username, password)
        VALUES($1, $2, $3)
        RETURNING *
    `;

    const response = await client.query(SQL, [
        uuid.v4(),
        username,
        await bcrypt.hash(password, Math.floor((Math.random() * 10)) + 1)
    ])

    return response.rows[0]
};

//function createProduct
const createProduct = async({name}) => {
    const SQL = `
        INSERT INTO products(id, name)
        VALUES($1, $2)
        RETURNING *
    `;

    const response = await client.query(SQL, [
        uuid.v4(),
        name
    ]);

    return response.rows[0]
};

//function createFavorite
const createFavorite = async({user, product}) => {
    const SQL = `
        INSERT INTO favorites(id, user_id, product_id)
        VALUES($1, $2, $3)
        RETURNING *
    `;

    const response = await client.query(SQL, [
        uuid.v4(),
        user,
        product
    ])

    return response.rows[0]
};

//function fetchUsers
const fetchUsers = async() => {
    const SQL = `SELECT id,username FROM users`;
    const response = await client.query(SQL);
    return response.rows
};

//function fetchProducts
const fetchProducts = async() => {
    const SQL = `SELECT * FROM products`;
    const response = await client.query(SQL);
    return response.rows
};

//function fetchFavorites
const fetchFavorites = async({user}) => {
    const SQL = `
        SELECT user_id,product_id FROM favorites
        WHERE user_id=$1    
    `;
    const response = await client.query(SQL, [user]);
    return response.rows
};

//Function destroyFavorite
const destroyFavorite = async({id, user}) => {
    const SQL = `
        DELETE FROM favorites
        WHERE id=$1 AND user_id=$2
    `;

    return await client.query(SQL, [
        id,
        user
    ])
}

//Export the functions from the file
module.exports = {
    client,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite
}