### 写在前面的话 
 1. 该篇博客承接上一篇博客。
 2. 该博客写的当天，Meteor 0.8.0发布，改动比较大，因为从本篇博客开始使用0.8.0版。由于本人对新版本没有实战开发，因此会有描写不到位的地方，忘谅解。
 3. 本篇博客仅为参考。更多细节请阅读官方文档。
 

----

#### publish 回调函数中 client端传递过来参数的使用。

接着上一篇博客的源代码：

publish.js

```js
Meteor.publish("people", function (random) {
//接收从客户端传过来的参数random。这里让参数为一个50以内的随机整数。根据不同的值，返回不同的结果集
//这里只是对参数的简单使用，更灵活的使用可以根据实际情况来。比如将参数作为数据集查询条件等。
	console.log(random);
    if(random<30){    
        return PeopleCollection.find({},{limit:1}); //如果客户端传过的参数小于30则只返回一行结果，下面的意思一样，分别是3，5个数据  
    }else if(random>30){  
        return PeopleCollection.find({},{limit:3});    
    }else{  
        return PeopleCollection.find({},{limit:5})  
    }  
}); 
```
subscribe.js
```js
//随机传递一个随机数 这个随机数可以根据实际换成相关的活性数据源，每次数据源发生变化，这个数据集合就会重新获取。
//个人建议：当数据集合过大时，不要经常改变 数据集的限制条件（传个服务端的），这样会造成比较大的网络开销，尤其在网络环境不好而且数据量比较大的情况下，会出现一些意向不到的情况。
Meteor.subscribe("people_safe",Math.floor(Math.random()*10)*5,function(){
	console.log("数据订阅完成");
	//获取数据后打印  服务端发送过来的数据集
	console.log(PeopleCollection.find({}).fetch());
});
```

现在启动服务器。打开浏览器 访问```localhost:3000```,打开浏览器控制台。可以看获取的的数据集合。每次刷新浏览器，数据都可以不同。


#### publish 回调函数中 内置参数的使用。

根据官方文档介绍，内部参数主要有以下几个
```js
this.userId
this.added(collection, id, fields)
this.changed(collection, id, fields)
this.removed(collection, id)
this.ready()
this.onStop(func)
this.error(error)
this.stop()
this.connection
```

下面将有选择的 对上面的函数进行代码示例说明。

##### this.userId

当你使用了 包 Accounts 后，存在用户登录管理，该字段有效。
这个字段表示当前的用户id。当用户id改变时，meteor将重新推送数据。因为目前没有涉及到包的使用。那么这里只是对它进行简单的代码说明。以后如果讲到Accounts的使用后，读者自会明白怎么样有效使用它。
（ps：下面这段代码不会出现在 供下载的源码包里。）
```js

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
	//self.ready表示 数据已经准备完毕，可以推送到客户端了。
	self.ready();
	//注意 和以前的使用方法不一样，这里没有return，要返回的数据都包涵在self里面了。

});
```
修改后的subscribe.js:
```js
Meteor.subscribe("people_safe",function(){
	console.log("数据订阅完成");
	//获取数据后打印  服务端发送过来的数据集
	console.log(PeopleCollection.find({}).fetch());
});
```

启动应用，打开浏览器控制台。刷新页面 观察代码效果。

看到数据打印后，来证明一下，前台浏览器的数据修改对数据库有效。

首先在浏览器端获取一个数据对象，在控制台输入：
```
console.log(EJSON.stringify(PeopleCollection.findOne()))

会看到类似下面的结果：

{"_id":"CEuSX5JGTFF9w8fvr","name":"小A","address":"长沙","phone":"111","testAdded":true} 
这里把注意，_id的值你的和我的不同，因为这个是随机生成的标识符。

输入:注意输入 你控制台上对应_id 而不是拷贝我的。

PeopleCollection.update("CEuSX5JGTFF9w8fvr",{$set:{name:"小A-AddTest"}})

如果你的update第一个参数_id没有填写错误，那么应该是修改成功了。

好，现在来看一个比较神奇的现象。

重新运行

console.log(EJSON.stringify(PeopleCollection.findOne()))

发现一个有趣的现象，打印的结果是：
{"_id":"CEuSX5JGTFF9w8fvr","name":"小A","address":"长沙","phone":"111","testAdded":true}

和没有修改数据之前是一样的！！

(注意保持Meteor服务器开启，新开一个shell或者cmd窗口)
接着我们看看数据库中数据是否发生了改变，以下为shell命令（CMD命令也是一致的）
假设API-003是应用目录。

cd API-003
meteor mongo
use meteor
db.people.find()

会发现数据集中一个数据的name字段确实改变了。（但是testAdded字段没有，因为说过，testAdded字段只是出现在当前副本数据，不影响数据库）

其实我们只要刷新一下浏览器，也可以看到修改后的结果。
那么得出一个结论：

通过this.added 修改后的数据是数据库的一部分副本，在服务端该副本不对数据库产生影响。
当在浏览器端，对对于的数据集对像进行操作时，数据会影响到数据库，但是不会使本地数据副本更新，那么可以认为该数据副本是没有活性的。也就是不会同步到其他客户端，后台数据的变化也不会影响到当前浏览器端的这个副本。

上面这段话可能表述不是很清楚，但是代码的结果可以很好的解释这个this.added的作用。

```

##### this.changed(collection, id, fields) this.removed(collection, id)

这两个函数的作用 各位可以根据added的代码 进行相应的测试，这里不再表述。它对数据集的影响和added一致。 源码中将会贴出这部分代码。就不再博客里面赘述了。





