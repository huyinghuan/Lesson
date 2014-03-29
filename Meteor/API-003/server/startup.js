Meteor.startup(function(){ //应用启动时，初始化一些数据进去people集合
	//每次应用启动清空数据
	PeopleCollection.remove({});
	//这里的People使用的就是collections.js中定义的数据集操作对象
	var peoples = [
		{name:"小A",address:"长沙",phone:"111"},
		{name:"小B",address:"常德",phone:"222"},
		{name:"小C",address:"衡阳",phone:"333"},
		{name:"小D",address:"衡南",phone:"444"},
		{name:"小E",address:"株洲",phone:"555"}
	];
	for (var i = 0; i < peoples.length; i++)
		PeopleCollection.insert(peoples[i]);
});