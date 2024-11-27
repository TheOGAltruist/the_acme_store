const {
    client,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite
} = require("./db")

//Initialize the app
const express = require("express")
const app = express();
const port = process.env.PORT;

//Configure Middleware dependencies
app.use(express.json())
app.use(require("morgan")("dev"))

//App routes
app.get("/api/users", async(req, res, next) => {
    try {
        res.send(await fetchUsers());
    } catch (error) {
        next(error)
    }
});

app.get("/api/products", async(req, res, next) => {
    try {
        res.send(await fetchProducts());
    } catch (error) {
        next(error)
    }
});

app.get("/api/users/:id/favorites", async(req, res, next) => {
    try {
        res.send(await fetchFavorites({user: req.params.id}));
    } catch (error) {
        next(error)
    }
});

app.post("/api/users/:id/favorites", async(req,res, next) => {
    try {
        res.status(201).send(
            await createFavorite({
                user: req.params.id,
                product: req.body.product_id
            })
        );
    } catch (error) {
        next(error)
    }
})

app.delete("/api/users/:id/favorites/:favorite_id", async(req, res, next) => {
    try {
        res.status(204).send(
            await destroyFavorite({
                id: req.params.favorite_id,
                user: req.params.id
            })
        )
    } catch (error) {
        next(error)
    }
})

//Error handling
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send({ error: err.message || err });
});

//App initialization function
const init = async() => {
    await client.connect();

    //Create tables
    await createTables();

    //Create users
    const [Sravan, Tyler, Adam, Andrew] = await Promise.all([
        createUser({username: "Sravan", password: "password"}),
        createUser({username: "Tyler", password: "password1"}),
        createUser({username: "Adam", password: "password2"}),
        createUser({username: "Andrew", password: "password3"})
    ]);

    //Print to console
    console.log(await fetchUsers());

    //Create products
    const [Vase, Rose, Shirt, Jacket] = await Promise.all([
        createProduct({name: "Vase"}),
        createProduct({name: "Rose"}),
        createProduct({name: "Shirt"}),
        createProduct({name: "Jacket"})
    ]);

    //Print to console
    console.log(await fetchProducts());

    //Create Favorites
    const [favorite, favorite1, favorite2] = await Promise.all([
        createFavorite({user: Sravan.id, product:Rose.id}),
        createFavorite({user: Tyler.id, product:Vase.id}),
        createFavorite({user: Adam.id, product:Shirt.id}),
        createFavorite({user: Andrew.id, product:Jacket.id})
    ])

    //Print to console
    console.log(await fetchFavorites({user: Sravan.id}));

    //Destroy a favorite
    await destroyFavorite({id: favorite.id, user: Sravan.id}) 

    //Print to console
    console.log(await fetchFavorites({user: Sravan.id}));

    //For dev
    app.listen(port, () => console.log(`Listening on port ${port}`))
}

init();