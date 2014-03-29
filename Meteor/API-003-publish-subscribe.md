### 写在前面的话 
 1. 本篇博客主要讲 publish和subscribe
 2. 使用的meteor版本为0.7.0.1
 3. 本篇博客主要是完善以前写过的一篇博客[Meteor中subscribe和publish简单介绍][1]
 4. 老话重提 ,尽量以官方文档为主
 5. 本篇博客有不正确的地方在所难免，如有发现望指出。
 6. 本篇博客涉及到另外一个知识点 Collection，不会详说，将作为独立的博客进行说明。

#### 功能
 主要是控制服务端如何向客户端推送数据，以及客户端如果接收数据集

#### publish Server

首先，在你实验这个函数之前 你应该移除meteor默认的一个包 autopublish
```
meteor remove autopublish
```
这个包的作用是自动推送你定义的所有数据集到客户端。这样做的一个好处是，方便新接触meteor的新手，因为它不需要进行更多的配置，不需要处理publish和subscibe函数。自然好处是相对的，在实际开发过程中，据的权限等方面都要求我们对客户端获取的数据集进行精确的控制。这就是publish和subscribe所要实现的功能了。

#### collection
在推送数据集的之前，首先需要定义数据集，也就是连接mongodb中的某个数据集，如果该数据集不存在，则会自动创建一个空的数据集。 定义数据集很简单：
```js
PeopleCollection = new Meteor.Collection("people");
```
注意这里的```people```就是mongodb中的数据集的名称。在初始化应用后，你可以连接mongodb，用shell查看是否存在这个数据集。因为这个数据集将在客户端和服务端同时使用，请确保这个定义位于 server和client文件夹之外（其他的public更不用说了，文件夹的作用在前面的博客（<二>）已经提到过了）。我的做法一般是在应用的根目录下新建一个```conllection.js```专门用来声明数据集。这里的的```PeopleCollection```对象 就可以操作这个```people```数据集了。请注意因为数据集对象```PeopleCollection```是在客户端和服务端同时使用的，所以确保定义的时候不要加```var``` 这个涉及到了Meteor中的作用域了，各中原因以后专门一篇博客讲述。这里稍微提一下，用```var```定义的变量只存在于文件作用域。跨文件不可用。这一点和普遍html中的js不同。另外在对于数据集对象命名时 个人建议变量带有特殊的单词 以便与其他类型的变量区别开来，也避免在不经意间造成变量的重复命名。我的个人习惯是数据集对象以Collection结尾，如：XXXCollection

#### publish
publish函数 在服务端进行使用。它具体说明如下：
```js
publish(name,func)
//name:数据集的名字，数据类型 string，必需。 
//func:回调函数，控制发布到客户端的数据集内容，或进行数据二次处理
它可以接受一个或多个参数来自客户端的参数。当然函数本身this也带有一些其他属性。后文将说到。
```

解释了这些，其实不如一段代码来的清晰。注意每次代码前我都会标注一下文件组织结构格式，以```|--```表示下一层目录。以`-`表示应用根目录。用fold表示文件夹，file表示文件。（其实  没带后缀的就是文件夹带了后缀的就是文件）
```js
-
--server #fold
    |-- startup.js #file
    |-- publish.js #file
--collection.js #file
```

collctions.js
```js
PeopleCollection = new Meteor.Collection("people");###声明数据集
```

startup.js  初始化一些数据。如果不明白函数是干什么用的不要紧。后面的博客将会说。这里是在启动时mongodb中的people数据集加入一些数据进去，以便我们测试demo
```js
Meteor.startup(function(){ //应用启动时，初始化一些数据进去people集合
	if(PeopleCollection.find().count() != 0){
	    return;
	}
	//这里的 PeopleCollection 使用的就是collections.js中定义的数据集操作对象
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
```

publish.js
```js
//向客户端发布集合  第一个参数为集合的名字，随意取，但是我们一般取与后台定义集合相同的名字，如果```new Meteor.Collection("people")```用的是people，那么这里也用people;。当然如果为了保密性和安全性，可以随意取，我们做测试加个后缀_safe。只要保证返回的结果集是你想返回的就可以了。
//第二个参数，是一个函数，当客户端需要传参数进来时可以通过此函数，参数可以是多个，不限于当前举例的2个
Meteor.publish("people_safe", function (arg1,arg2) {
  console.log(arg1+ar2);
  console.log(arguments);
  return PeopleCollection.find({})
});
```
现在把这个demo跑起来。
```
meteor remove autopublish  #先把自动数据推送包给移除
meteor #运行meteor
```
启动后打开浏览器```http://localhost:3000/``` 界面上什么都没有。没关系，我们前面什么都没有添加，是这样的。现在打开chrome控制台，前面的博客提到过使用控制台。输入
```
PeopleCollection.find({}).fetch()
```
返回一个空的数组。这是因为我们虽然在服务端进行了数据的推送，但是我们没有在客户端进行数据的订阅。所以客户端没有任何数据。现在来看客户端的订阅数据函数。现在先关闭浏览器并停止应用。

####subscribe  Client
主要是订阅设置接收服务端的数据
```
Meteor.subscribe(name [, arg1, arg2, ... ] [, callbacks])

name：设置要获取的服务端定义推送的数据集。也就是在Meteor.publish的第一个参数是什么，那么你接受该publish推送的数据时也应该用什么。 必需。

[arg1,arg2,...] 是可选参数。用来传递给  服务端publish函数的第二个参数回调函数 做参数。有点罗嗦，等下看代码就很清楚了。

callbacks  是客户端拿到数据后 可以执行的回调函数。
```
看代码，现在应用结构是：(新增了一个文件夹啊)
-
```
--server #fold
    |-- startup.js #file
    |-- publish.js #file
--client #fold
    |-- subscribe.js
--collection.js #file
```
subscribe.js
```
//这里传两个参数过去
Meteor.subscribe("people_safe",1,"hello world",function(){
	console.log("数据订阅完成");
});
```
重新启动应用。
这时在浏览器还没有访问时，没有任何输出，因为没有任何客户端存在，现在打开浏览器访问应用```http://localhost:3000/```
这时在服务端后台会马上看到传递过去的参数打印出来。同时打开浏览器控制台，同样会看到subscribe的回调函数有执行。
然后我们在浏览器的控制台再次运行（小技巧：可以按上下方向键调出输入历史，避免每次都进行输入）
```
PeopleCollection.find({}).fetch()
```
这时就有数据打印出来了。

到这里就简单介绍了一下数据的定义，推送，订阅流程。更详细的内容，我将在下一篇博客进行说明。
文中源码可以到这里http://download.csdn.net/detail/a6383277/7110137下载。
```
源码使用说明：
因为打包的源码中没有包括mongodb数据库文件（这些文件太大了，所以没有打包经来），需要进行一定的操作后代码才能正常运行
1.下载拿到压缩文件后，解压。
2. 在你的工作目录下新建一个工程如：
meteor create api003
进入到api003目录下，剪切.meteor文件夹到解压后的文件夹里。注意在linux和mac 下，.meteor可能是隐藏的。通过ctrl+H可以让它显示出来。window下则不会隐藏。
这是就可以运行了。有任何问题可以在博客下方留言

```
  [1]:http://blog.csdn.net/a6383277/article/details/8613677