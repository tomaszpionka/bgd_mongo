//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const homeStartingContent = "Check interesting facts from PJWSTK Data Science world.";
const composeContent = "Share your thoughts.";
const aboutContent = "Welcome to the space of Data Science students. This is a project for BGD labs.";
const contactContent = "You can contact me via";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:<PASSWORD>@bgd.nuzwg.mongodb.net/Blog?retryWrites=true&w=majority", {useNewUrlParser: true});

/* 
Replace <password> with the password for the admin user. 
Replace myFirstDatabase with the name of the database that connections will use by default. 
Ensure any option params are URL encoded.
*/

const postSchema = {
  title: String,
  content: String,
  timestamp: Date
};

const commentSchema = {
  post: String,
  author: String,
  content: String,
  timestamp: Date
};

const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

app.get("/compose", function(req, res){
  res.render("compose", {
    composeContent: composeContent
    });
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    timestamp: new Date()
  });

  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

app.post("/comments/post/:postId", function(req, res){
  if (/\S/.test(req.body.commentAuthor) && /\S/.test(req.body.commentBody)) {
    const comment = new Comment({
      post: req.params.postId,
      author: req.body.commentAuthor,
      content: req.body.commentBody,
      timestamp: new Date()
    });

    comment.save(function(err){
      if (!err){
          res.redirect("/posts/"+req.params.postId);
      }
    });
  } else {
    res.redirect("/posts/"+req.params.postId)
  }
});

app.get("/posts/:postId", async function(req, res){

const requestedPostId = req.params.postId;

let comments = await Comment.find({ post: requestedPostId });

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content,
      postId: requestedPostId,
      comments: comments
    });
  });
});

app.post("/posts/delete/:postId", function(req, res){

  const requestedPostId = req.params.postId;
    
    Post.deleteOne({_id: requestedPostId}, function(err, post){
      res.redirect("/");
    });
});

app.post("/posts/update/:postId", async function(req, res){
  
  if (/\S/.test(req.body.postBody)) {
    // string is not empty and not just whitespace
    const requestedPostId = req.params.postId;
    const filter = { _id: requestedPostId };
    const update = { content: req.body.postBody, timestamp: new Date()};
    
    await Post.countDocuments(filter); // 0
    
    let post = await Post.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true // Make this update into an upsert
    });
    post.save(function(err){
      if (!err){
          res.redirect("/");
      }
    });
  } else {
    res.redirect("/");
  }
});


app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);