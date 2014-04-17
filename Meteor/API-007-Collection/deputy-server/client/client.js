//不同定义的Collection
function defineCollection(){
	console.log("================================defineCollection");
	console.log("RemotePeople findOne:");
	console.log(RemotePeople.findOne());
	console.log("IDPeople findOne:");
	console.log(IDPeople.findOne());
	console.log("People findOne:");
	console.log(People.findOne());
	console.log("LocalPeople findOne:");
	console.log(LocalPeople.findOne());
	console.log("================================defineCollection");
}

Meteor.setTimeout(defineCollection,5000);

function show(object){
	console.log(JSON.stringify(object))
}
//find函数
function find(){
	console.log("原始数据：")
	var oriResult = People.find({}).fetch()
	show(oriResult);
	console.log("sort：");
	var sortResult = People.find({},{sort:{age:1}}).fetch(); //结果集以age升序
	show(sortResult)
	console.log("fields : 只显示name字段(默认情况下会显示_id字段)");
	var fieldsResult1 = People.find({},{fields:{name:1}}).fetch(); 
	show(fieldsResult1)
	console.log("fields : 只显示name字段,不显示_id字段");
	var fieldsResult2 = People.find({},{fields:{name:1,_id:0}}).fetch(); 
	show(fieldsResult2)
	console.log("fields : 隐藏phone字段");
	var fieldsResult3 = People.find({},{fields:{phone:0}}).fetch(); 
	show(fieldsResult3)

	console.log("skip,limit : 跳过两条数据，然后显示2条数据");
	var skipResult2 = People.find({},{skip:2,limit:2}).fetch(); 
	show(skipResult2)

	console.log("综合应用 : 以age升序，跳过两条数据，然后显示2条数据，隐藏phone字段");
	var result = People.find({},{skip:2,limit:2,fields:{phone:0},sort:{age:1}}).fetch(); 
	show(result)

	console.log("在上一个结果综合应用上所有age + 20")
	var result2 = People.find({},{skip:2,limit:2,fields:{phone:0},sort:{age:1},transform:function(doc){
			doc.age = doc.age+20
			return doc;
		}}).fetch(); 
	show(result2)
}

Meteor.setTimeout(find,10000);

//活性数据源
Template.relative.people = function(){
	return  People.find({}).fetch(); 
}
//非活性数据源
Template.noRelative.people = function(){
	return  People.find({},{reactive:false}).fetch(); 
}

function changeDate(){
	People.insert({age:1000,name:"ChageDate"})
}
//20秒后 改变数据源 发现 没有reactive:false的 改变了，有reactive:false的部分没有改变 
//(注意这里需要刷新一次页面后才能看到效果,因为本地的数据还没有从服务器拿过来就在页面上显示了，
	//这是页面是无数据的，然后服务器数据拉取过来后,数据变化了，前一个是活性数据源所以马上就显示了，
	//后一个非活性数据源，就不会显示数据，所以需要在页面要等数据缓存下来后刷新一次后，在插入数据才能看到效果
	//其实，第一次数据显示不出来 也是设置了非活性数据选项的原因)
Meteor.setTimeout(changeDate,15000);