/*
**这部分代码主要测试 客户端传递参数的处理 示例代码 
**为了保证代码 的完整性 同时和程序可运行，请注释掉相关不需要的代码片段，保留一个publish函数即可。
**同时将位代码片段 编号，一遍与subscribe.js的代码片段对应。
** 编号： demo-001

Meteor.publish("people_safe", function (random) {
//接收从客户端传过来的参数random。这里让参数为一个50以内的随机整数。根据不同的值，返回不同的结果集
//这里只是对参数的简单使用，更灵活的使用可以根据实际情况来。
	console.log(random);
    if(random<30){    
        return PeopleCollection.find({},{limit:1}); //如果客户端传过的参数小于30则只返回一行结果，下面的意思一样，分别是3，5个数据  
    }else if(random>30){  
        return PeopleCollection.find({},{limit:3});    
    }else{  
        return PeopleCollection.find({},{limit:5})  
    }  
});

*/ 

/*
** 编号： demo-002
Meteor.publish("people_safe", function(){
	//通过使用this.added函数进行数据的重写改写。这里为数据对象增加一个 testAdded 字段

	//避免this 在内部回调函数中的混淆使用，重新引用到self 个人建议：在需要使用this尽量使用其他变量代替。
	var self = this;
	var beforeList = PeopleCollection.find({}).fetch();
	console.log(beforeList);//在服务端打印未修改之前的数据

	//修改数据
	//注意这样的修改不会个改变原始数据，也就是它只是一个临时数据的集合，经过了一定程度的加工而已，不会实际影响到数据库里面的数据，
	//你只要刷新浏览器，在看看服务端的打印就可以了明白。
	PeopleCollection.find({}).forEach(function(item){
		item["testAdded"] = true;
		//注意这里的第一个参数一定要和conllection.js里面定义的一致，
		//不然的话 前台无法获取数据，因为PeopleCollection是关联的people数据集的。
		//可以看成self.added方法的调用,申请了一个'假的'数据集(没有对实际数据库里面的数据进行任何修改)
		//这一点可以在启动系统打开浏览器后，连接mongodb进行查看原始数据。
		//当然浏览器端对数据增删改还是会影响数据库里面的数据的，因为该self里面的数据副本的_id和原始数据_id一致，
		//而且前台对数据的修改也是根据_id来的。
		self.added('people',item._id,item);
	});
	//数据已经准备完毕
	self.ready();
	//注意 和以前的使用方法不一样，这里没有return，要返回的数据都包涵在self里面了。

});

*/

/*
** 编号： demo-003
Meteor.publish("people_safe", function(){

	//避免this 在内部回调函数中的混淆使用，重新引用到self 个人建议：在需要使用this尽量使用其他变量代替。
	var self = this;
	var beforeList = PeopleCollection.find({}).fetch();
	console.log(beforeList);//在服务端打印未修改之前的数据

	PeopleCollection.find({}).forEach(function(item){

		self.added('people',item._id,item);//请思考测试一下，如果把这句注释掉，会发生什么？为什么？

		//注意这里的第一个参数一定要和conllection.js里面定义的一致，
		//第三个参数是需要修改的字段和它的新值。如果该字段在数据对象里面，而它的新值为undefined那么这个字段将被移除，
		//如果这个字段不在对象里，那么改变将会舍弃
		//这里我们改变name字段，舍弃address字段，另外测试一个无用字段

		self.changed('people',item._id,{name:item.name+"Changed",address:undefined,hello:123});
	});
	
	//数据已经准备完毕
	self.ready();

});
*/

/*
**编号：  demo-004
Meteor.publish("people_safe", function(){

	//避免this 在内部回调函数中的混淆使用，重新引用到self 个人建议：在需要使用this尽量使用其他变量代替。
	var self = this;
	var beforeList = PeopleCollection.find({}).fetch();
	console.log(beforeList);//在服务端打印未修改之前的数据

	PeopleCollection.find({}).forEach(function(item){
		self.added('people',item._id,item);//请思考测试一下，如果把这句注释掉，会发生什么？为什么？
		
	});
	
	var id = beforeList[0]._id;

	self.removed("people", id)
	//数据已经准备完毕
	self.ready();

});
*/