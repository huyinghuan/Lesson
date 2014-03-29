Meteor.startup(function(){
   console.log(Meteor.absoluteUrl());
   Meteor.absoluteUrl.defaultOptions.rootUrl = "http://mydomain.com";
   console.log( Meteor.absoluteUrl());
   console.log( Meteor.absoluteUrl("hello"));
});