//var remote =  DDP.connect("http://localhost:3010");//链接远程服务器
//People  =  new Meteor.Collection('people',remote)

//创建一个本地(临时)数据集,不会保存到数据库.
LocalPeople = new Meteor.Collection(null);

//创建一个数据集,会保存到数据库.这是最普通的用法.也是最普遍的用法
People = new Meteor.Collection("people") 

//创建一个远程服务器的数据集引用.它不会保存到本地数据库
var remote = DDP.connect('http://localhost:3010');
RemotePeople = new Meteor.Collection("people",remote)

//创建一个数据集指定它的ID生成方式
IDPeople = new Meteor.Collection("idpeople",{'idGeneration':'MONGO'})
//或者
//IDPeople = new Meteor.Collection('idpeople',remote,'MONGO')

//5.使用transform
TransformPeople = new Meteor.Collection('tranpeople',{'transform':function(docs){
	//console.log("transform:==============开始")
	docs['transform']=true;
	//console.log(docs);
	//console.log("transform:==============结束")
	return docs;
}});