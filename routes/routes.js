const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const multer = require("multer");
const fs = require("fs");

//image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

//insert products
router.post("/add", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      const product = new Product({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        status: req.body.status,
        image: req.file.filename,
      });
      product
        .save()
        .then(() => {
          req.session.message = {
            type: "success",
            message: "Product added succesfully!",
          };
          res.redirect("/");
        })
        .catch((err) => {
          res.json({ message: err.message, type: "danger" });
        });
    }
  });
});

//get all products
router.get("/", (req, res) => {
  Product.find()
    .then((result) => {
      const message = req.session.message;
      res.render("index", {
        title: "Home Page",
        products: result || [],
        message: message,
      });
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
});

router.get("/add", (req, res) => {
  res.render("add_products", {
    title: "Add Products",
  });
});

router.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  Product.findById(id)
    .then((result) => {
      res.render("edit_products", {
        title: "Edit Product",
        product: result,
      });
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
});

router.post("/update/:id", upload, (req, res) => {
  const id = req.params.id;
  const product = {
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock,
    status: req.body.status,
  };
  if (req.file) {
    product.image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    product.image = req.body.old_image;
  }
  Product.findByIdAndUpdate(id, product)
    .then(() => {
      req.session.message = {
        type: "success",
        message: "Product updated succesfully!",
      };
      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
});

router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  Product.findByIdAndDelete(id)
    .then((product) => {
      if (product) {
        // Hapus file gambar jika ada
        if (product.image) {
          try {
            fs.unlinkSync("./uploads/" + product.image);
          } catch (err) {
            console.log(err);
          }
        }
        // Hapus produk dari database
        return Product.findByIdAndDelete(id);
      } else {
        throw new Error("Product not found");
      }
    })
    .then(() => {
      req.session.message = {
        type: "success",
        message: "Product deleted successfully!",
      };
      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
});
module.exports = router;
