### 写在前面的话 
 1. 本篇博客主要讲 Collection，由于该部分比较长，会用两到三篇博客的内容描述.其实这个部分东西不好写博客,因为涉及到的都是一些操作语句,这个和mongodb的api有关
 2. 使用的meteor版本为0.8.0
 4. 老话重提 ,尽量以官方文档为主
 5. 本篇博客有不正确的地方在所难免，如有发现望指出。
 6. 本篇博客地址：http://blog.csdn.net/a6383277/article/details/23656929 转载请注明出处，谢谢
 7. 编程环境：ubuntu （涉及到的shell，代码等）

---

### Collections

Collctions是meteor中的比较重要的部分，Meteor把数据存储到Collection中。 Collections对象的函数主要是对数据集合的CURD等操作。如何你对NoSQL有一定的了解的话，那么对这个对象应该会比较熟悉，它的操作与 NoSQL语句类似。 在Meteor中，现在主要是使用Mongodb，在官方文档中，开发者表示会支持其他的数据库，不过那是在将来了。

#### 构造函数 new Meteor.Collection(name, [options])   @Anywhere

如果你要声明一个数据集合Collection（类似于sql中的表的概念），那么就用上面的构造函数了。先看下它的参数：

#### name
    数据集的名字，String类型。在Mongodb中就有一个与之对应的Collection了。如果这个name为null，那么只是生成一个非托管的(临时的数据集合)数据集合了。至于是什么意思的，下文通过代码来解释。

#### options
    可选的参数有:
    connection.这是个object对象,指定连接的服务器对象.具体可以见上一篇博客DDP subscribe相关的内容.这个时候就是订阅远程的数据集了.
    如果name为空,那么就不能使用这个选项.默认情况都是省略该选项的,表明连接本地数据.
    idGeneration: 每条数据_id生成的方案,字符串.有两个选择:'STRING'和'MONGO',STRING是一个随机字符串.而MONGO是一个Mongodb的ObjectID对象.使用过就清楚了.默认是 STRING.
    transform:在数据发送之前进行一定的处理.它是个function
    
    因此可以像下面几种方式使用:
```
//1.创建一个本地数据集,不会保存到数据库.也不会进行前后台同步,更不会多客户端同步了..
LocalPeople = new Meteor.Collection(null);

//2创建一个数据集,会保存到数据库.这是最普通的用法.也是最普遍的用法
People = new Meteor.Collection("people") 

//3.创建一个远程服务器的数据集引用.它不会保存到本地数据库
var remote = DDP.connect('http://localhost:3010');
RemotePeople = new Meteor.Collection("people",remote)

//4.创建一个数据集指定它的ID生成方式
IDPeople = new Meteor.Collection("idpeople",{'idGeneration':'MONGO'})
//或者
//IDPeople = new Meteor.Collection('idpeople',remote,'MONGO')

//5.使用transform
TransformPeople = new Meteor.Collection('tranpeople',{'transform':function(docs){
	console.log("transform:")
	docs['transform']=true;
	console.log(docs);
	return docs;
}});
```
具体区别请看源码中的defineCollection函数输出。


### collection.find(selector, [options])

这个是数据查询函数。
#### selector
selector一个查询条件。
当它是一个字符串时，
```
collection.find("string")
等同
collection.find({_id:"string"})

也就是说，如果传入的是字符串，那么将被当作数据的_id字段使用。
```
当它是一个Object对象时，(当为{}空对象时，查询所有数据)具体规则可以参考Mongodb的find。这里不多讲，也讲不完。具体见http://docs.mongodb.org/manual/tutorial/query-documents/ 和操作符  http://docs.mongodb.org/manual/reference/operator/query/

注意，这个find函数返回的不是一个数据数组，而是一个指向数据集的cursor。具体见下面的Cursor部分。


#### options
object 。可选的操作。对数据结果的处理选项。
```
sort：进行数据排序
排序规则
People.find({},{sort:[["age", "asc"], ["name", "desc"]]}) //进行age的升序排列，name的降序排列
或者
People.find({},{sort:{a: 1, b: -1}})
如果什么都不规定则默认为 自然语序 如 1,2,3 或者a,b,c,等

skip ：number  从开始 跳过多少条数据 返回

limit：number 限制多少条数据返回。

通过使用skip和limit可以实现数据分页

fields： 返回数据字段限制。


 People.find({}, {fields: {age: 0,name:0}}) 返回数据中不包含age,name字段
 
 People.find({}, {fields: {firstname: 1}})返回数据中'只'包含firstname字段
 
 注意0表示 排除，1表示 包含。 这两者不能同时使用。
 这样使用是错误 的：
 People.find({}, {fields: {firstname: 1，age: 0}})
 但是有一个例外，那就是_id字段。对于_id字段可以同时使用1或0.因为就算没有使用_id:1,_id字段也是默认返回的。如果不想要_id可以使用如下:
 People.find({}, {fields: {firstname: 1，_id: 0}}) 

reactive：boolean 设置返回的数据是不是活性数据源。默认值是true
 People.find({}, {reactive:false})
 如果是活性数据源，那么引用它的Template和Template对象 一旦结果集发生改变也会跟着改变。
 非活性数据源则不会带来Template的影响。具体请见Session博客那一章。
 
 transform：重写（如果在new Meteor.Collection('xxx',{transform:function(doc){..}})定义过的话）或者新增对于返回前 数据的修改等操作。

```

在当前代码里面，不展示关于remote的使用，我会注释掉相关，代码，如果你想使用，请把上篇博客的DDP的main-server跑在3010端口，在取消代码里面的注释即可。在下载代码包里，我会包含这个两个。shell是：
```
cd main-server
meteor run -p 3010

新开一个终端

cd deputy-server
meteor
```

deputy-server 结构如下：
```
- 根目录
|-Collection.js
-- client 文件夹
  |-client.js
  |-index.html
-- server 文件夹
  |-main.js
```

Collection.js

```
//var remote =  DDP.connect("http://localhost:3010");//链接远程服务器
//People  =  new Meteor.Collection('people',remote)

//创建一个本地(临时)数据集,不会保存到数据库.
LocalPeople = new Meteor.Collection(null);

//创建一个数据集,会保存到数据库.这是最普通的用法.也是最普遍的用法
People = new Meteor.Collection("people") 

//创建一个远程服务器的数据集引用.它不会保存到本地数据库
//var remote = DDP.connect('http://localhost:3010');
//RemotePeople = new Meteor.Collection("people",remote)

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
```

client.js
注意所有的打印都在浏览器控制台
```
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
```

index.html
```
<body>
	relative====================<br>
	{{> relative}}
	<br>======================================<br>
	no relative====================<br>
	{{> noRelative}}
</body>
<Template name="relative">
	{{#each people}}
		{{name}}-{{age}}-{{address}}<br>
	{{/each}}
</Template>
<Template name="noRelative">
	{{#each people}}
		{{name}}-{{age}}-{{address}}<br>
	{{/each}}
</Template>
```

main.js
```
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
```
第一部分到此结束

代码下载去我的github：github.com/huyinghuan/Lesson  的Meteor/API-007目录下。
或者CSDN下载：