Meteor.startup(function(){
	People.remove({});
	//这里的People使用的就是collections.js中定义的数据集操作对象
	var peoples = [
		{name:"小A",address:"长沙",phone:"111",age:2},
		{name:"小B",address:"常德",phone:"222",age:4},
		{name:"小C",address:"衡阳",phone:"333",age:3},
		{name:"小D",address:"衡南",phone:"444",age:1},
		{name:"小E",address:"株洲",phone:"555",age:10}
	];
	for (var i = 0; i < peoples.length; i++)
		People.insert(peoples[i]);


	//LocalPeople初始化一条数据
	LocalPeople.insert({name:"LocalPeople"}); //无法在客户端找到它,因为它是非同步的 

	IDPeople.insert({name:"IDPeople"})

	TransformPeople.insert({name:"TransformPeople"})
});