/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define a Book schema
const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      try {
        const books = Book.find({}, '_id title comments');
        const formattedBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(formattedBooks);  // By default, status 200 is sent
      } catch (err) {
        res.json({ error: 'Could not fetch books' });  // If there's an error, 200 is still sent, you can just return the JSON message
      }
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      let title = req.body.title;
      if (!title) {
        return res.json('missing required field title');
      }
      try {
        const newBook = new Book({ title });
        newBook.save();
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        res.json({ error: 'Could not create book' });
      }
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      try {
        Book.deleteMany({});
        res.json('complete delete successful');
      } catch (err) {
        res.json({ error: 'Could not delete books' });
      }
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const book = Book.findById(bookid);
        if (!book) {
          return res.json('no book exists');
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
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) {
        return res.json('missing required field comment');
      }
      try {
        const book = Book.findById(bookid);
        if (!book) {
          return res.json('no book exists');
        }
        book.comments.push(comment);
        book.save();
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.json({ error: 'Could not add comment' });
      }
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const book = Book.findByIdAndDelete(bookid);
        if (!book) {
          return res.json('no book exists');
        }
        res.json('delete successful');
      } catch (err) {
        res.json({ error: 'Could not delete book' });
      }
    });
  
};
