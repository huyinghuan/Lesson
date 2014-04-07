
Template.hello.greeting = function () {
  return EJSON.stringify(Meteor.status());
};

Template.hello.time = function () {
  var status = Meteor.status();
  var retryTime = status.retryTime;
  if(!retryTime){
  	return {}
  }
  var date = (new Date(retryTime)).toString();
  var second = Math.floor(retryTime - (new Date()).getTime()) / 1000;

  return {
	date:date,
	second:second
  }
};