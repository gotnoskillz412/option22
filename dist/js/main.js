!function(e){function r(n){if(t[n])return t[n].exports;var s=t[n]={exports:{},id:n,loaded:!1};return e[n].call(s.exports,s,s.exports,r),s.loaded=!0,s.exports}var t={};return r.m=e,r.c=t,r.p="",r(0)}([function(e,r,t){t(1),t(8),t(7),e.exports=t(6)},function(e,r,t){"use strict";var n=t(2),s=t(3),o=t(4),u=t(5),i=t(6),c=t(8),a=3e3,p=n();p.use(s.json()),p.use(s.urlencoded({extended:!1})),p.use(o()),p.use(c()),p.use("/",i.index),p.use(function(e,r,t){var n=new Error("Not Found");n.status=404,t(n)}),"development"===p.get("env")&&p.use(function(e,r,t){t.status(e.status||500),t.render("error",{message:e.message,error:e})}),p.use(function(e,r,t){t.status(e.status||500),t.render("error",{message:e.message,error:{}})}),p.listen(a,function(){u.info("App listening on port "+a+"...")})},function(e,r){e.exports=require("express")},function(e,r){e.exports=require("body-parser")},function(e,r){e.exports=require("cookie-parser")},function(e,r){e.exports=require("winston")},function(e,r,t){"use strict";r=e.exports={index:t(7)}},function(e,r,t){"use strict";var n=t(2),s=n.Router();s.get("/",function(e,r){r.status(200).send("ok")}),r=e.exports=s},function(e,r){"use strict";var t=function(){return function(e,r,t){t()}};e.exports=t}]);