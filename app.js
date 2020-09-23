var name = "";
var nm = false;
var og =true;
var iv;
// var toShow = false;
// var methodOverride = require("method-override");
var sam = new Date().toLocaleTimeString;
var express = require("express");
var mongoose = require("mongoose");
var bdy = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var app = express();
var isSigned = false;
var toSet = "";



app.use(bdy.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
mongoose.connect("mongodb+srv://Ip:mymongodb@cluster0-tp0zb.mongodb.net/port_data", { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true });
var userSchema = new mongoose.Schema({
    username: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("user", userSchema);
app.use(require("express-session")({
    secret: "NO SECRET",
    resave: false,
    saveUninitialized: false
}));

var peopleSchema = new mongoose.Schema({ 
     name:String,  
    image:[{body:String, date:String}],
     Hobbies:String,
     Interest:String,
     Achievements:String
});
var People = mongoose.model("people",peopleSchema);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
        
    }

    res.render("login.ejs",{c:true,iv:false,og:og});
}

app.get("/",function(req,res){ 
 
 if(isSigned){ 
    res.render("addY.ejs",{toShow:true,iv:false,og:og});    
 }else{ 

    People.find({},function(err,found){ 
        console.log(req.originalUrl);
        if(err){ 
             console.log(err);
        }else{ 
            if(req.isAuthenticated()){  
                og = false;
            }
             // console.log(found);
            //  console.log("connected to database");
             // res.render("index.ejs",{p:found,name:name,og:og});
             res.render("home.ejs",{p:found,name:name,og:og});
             og = true;
        }
    })
 
   
   



 }
   
     
})

app.get("/login",function(req,res){ 
    
     res.render("login.ejs",{c:false,iv:false,og:og});
       
})
app.get("/register",function(req,res){ 
     res.render("signup.ejs",{iv:false,og:og});
})

//post to register
app.post("/register", function (req, res) {
   name =  req.body.username;
    console.log(name);
    req.body.password;
    if(name == "" || req.body.password==""){  
        res.render("signup.ejs",{iv:true,og:og});
    }else{ 
    User.register(new User({ username: req.body.username }), req.body.password, function (err, made) {
        if (err) {
            console.log(err);
            return res.render("signup.ejs",{iv:false,og:og});
        } console.log("SUCCESS");
        /*res.send("SUCCESS");*/
        passport.authenticate("local")(req, res, function () {
            res.redirect("/addY");
            isSigned = true;
            
        })

    })
}
})


//post to login 
app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login"
}), function (req, res,next) {
     res.redirect(toSet);
    name = req.body.username;
    // console.log(name);
});
//logout route
app.get("/logout", function (req, res) {
    req.logout();
    name="";
    res.redirect("/");
})
app.get("/addY",isLoggedIn,function(req,res){ 
    People.findOne({name:name},function(err,found){ 
        // console.log(found);
         if(found === null){ 
            res.render("addY.ejs",{toShow:false,iv:false,og:og})
         }else{  
            //  console.log(found);
             res.render("addP.ejs",{al:true,f:found,og:og});
         }
    })
    
})

app.post("/addY",function(req,res){ 
    if(req.body.image == "" || req.body.hobbies=="" || req.body.interest=="" || req.body.achieve==""){ 
         res.render("addY.ejs",{toShow:false,iv:true,og:og});
    }else{  
        isSigned = false;
    // console.log(name);
    People.create({ 
        name:name, 
        image:[{body:req.body.image,
            date:new Date().toLocaleDateString() 
        }],
        Hobbies:req.body.hobbies,
        Interest:req.body.interest,
        Achievements:req.body.achieve
   },function(err,made){  
        if(err){ 
            console.log(err);
        }else{  
            console.log(made);   
            res.redirect("/");
        }
   });
}
})

app.get("/info/:id",isLoggedIn,function(req,res){  
     People.findById(req.params.id,function(err,found){ 
          if(err){  
              console.log(err);
          }else{ 
               if(name == found.name){  
                    nm = true; 
               }
               res.render("info.ejs",{p:found,nm:nm,og:og});
               nm = false;
          }
     })
})
app.get("/edit/:id",function(req,res) { 
    People.findById(req.params.id,function(err,found){  
        if(err){  
            console.log(err);
        }else{  
            // console.log(found.image[0].body);
          res.render("edit.ejs",{f:found,og:og});
        }
    }) 
})

app.post("/edit/:id",function(req,res){  
     People.findById(req.params.id,function(err,found){  
       if(err){ 
            console.log(err);
       }else{ 
            console.log(found);
            found.image[0].body = req.body.image;
            found.Hobbies=req.body.hobbies;
        found.Interest=req.body.interest;
        found.Achievements=req.body.achieve;
        found.save(function(){ 
             console.log("saved");
        });
            res.redirect("/");
            
       }
     });
})

app.get("/addP",isLoggedIn,function(req,res){
    People.findOne({name:name},function(err,found){  
     if(found === null){  
         res.render("addY.ejs",{toShow:true,iv:false,og:og});
     }else{ 
         res.render("addP.ejs",{al:false,f:found,og:og});
     }
    })
                                                 
})
app.post("/addP",function(req,res){  
     console.log(name);
    People.findOne({name:name},function(err,found){  
        if(err) { 
            console.log(err);
            res.send("error");
        }else{  
            // console.log(found);
            found.image.push({ body: req.body.image,
                date:new Date().toLocaleDateString()
            })
         found.save(function(err){  
             if(err){  
                 console.log(err);
             }else{  
                //  console.log("saved");
                 res.redirect("/");
             }
         })
        }
    })
})
app.get("/users",function(req,res){  
      if(isSigned){  
        res.render("addY.ejs",{toShow:true,iv:false,og:og});
     }else{
        People.find({},function(err,found){  
            if(err){ 
                 console.log(err);
            }else{  
                res.render("users.ejs",{u:found,og:og});
            }
     })
        
     }
})
    

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port,function(){ 
    console.log("server Started on port " + port);
})
