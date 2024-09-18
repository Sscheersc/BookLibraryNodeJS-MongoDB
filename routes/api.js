'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const mongoURI = process.env.DB

mongoose.connect(mongoURI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Define a Book schema
const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      try {
        const books = await Book.find({}, '_id title comments');
        const formattedBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(formattedBooks);
      } catch (err) {
        res.json({ error: 'Could not fetch books' });
      }
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      try {
        const newBook = new Book({ title });
        await newBook.save();
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        res.json({ error: 'Could not create book' });
      }
    })
    
    .delete(async function(req, res){
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.json({ error: 'Could not delete books' });
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.json({ error: 'Could not fetch book' });
      }
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) {
        return res.send('missing required field comment');
      }
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        book.comments.push(comment);
        await book.save();
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.json({ error: 'Could not add comment' });
      }
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      try {
        const book = await Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.json({ error: 'Could not delete book' });
      }
    });
  
};
