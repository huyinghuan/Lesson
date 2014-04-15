Meteor.startup(function(){
	//LocalPeople初始化一条数据
	LocalPeople.insert({name:"LocalPeople"}); //无法在客户端找到它,因为它是非同步的 

	People.insert({name:"People"});

	IDPeople.insert({name:"IDPeople"})

	TransformPeople.insert({name:"TransformPeople"})
});