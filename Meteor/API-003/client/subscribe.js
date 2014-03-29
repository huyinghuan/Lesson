/*
**编号 demo-001
//随机传递一个随机数
Meteor.subscribe("people_safe",Math.floor(Math.random()*10)*5,function(){
	console.log("数据订阅完成");
	//获取数据后打印  服务端发送过来的数据集
	console.log(PeopleCollection.find({}).fetch());
});
*/

/*
**编号 demo-002,demo-003,demo-004 共用
Meteor.subscribe("people_safe",function(){
	console.log("数据订阅完成");
	//获取数据后打印  服务端发送过来的数据集
	console.log(PeopleCollection.find({}).fetch());
});
**/

