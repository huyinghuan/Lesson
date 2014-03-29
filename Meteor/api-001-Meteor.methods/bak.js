/*
*

On the client, if you do not pass a callback and you are not inside a stub, call will return undefined

server.js :


Meteor.methods({
  hello:function(){
    console.log("server");
    return 10;
  }
});




client.js:
Meteor.methods({
  hello:function(){
    console.log("clent");
    return 12;
  },
  say:function(){
    console.log('say');
    var hello = Meteor.call("hello");
    console.log(hello)
  }
});

*/