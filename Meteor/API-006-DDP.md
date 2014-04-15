### 写在前面的话 
 1. 本篇博客主要讲 DDP
 2. 使用的meteor版本为0.8.0
 4. 老话重提 ,尽量以官方文档为主
 5. 本篇博客有不正确的地方在所难免，如有发现望指出。
 6. 本篇博客地址：http://blog.csdn.net/a6383277/article/details/23656929 转载请注明出处，谢谢

### DDP

这个类只有个方法 DDP.connect(url)，先来看看这个类的作用是什么。
官方文档是这样说的：

>Connect to the server of a different Meteor application to subscribe to its document sets and invoke its >remote methods.

大概翻译一下：连接不同的Meteor应用 订阅它的数据集而且调用它的远程方法。从而可以通过一个公开的数据集合订阅构建自己的应用。等下通过代码来解释。
现在看是使用

#### DDP.connect(url)  @Anywhere
这个函数可以在客户端或者服务端使用。
参数url是你需要订阅的另个Meteor应该的连接地址。这个函数会返回一个对象，这个对象中包含一下方法（这些方法不是都能在客户端和服务端同时调用的）：

```
subscribe - 订阅一个数据集
call - 调用函数. 具体见： Meteor.call.
apply - 调用函数. 具体见：Meteor.apply.
methods - Define client-only stubs for methods defined on the remote server. See Meteor.methods.
status - 当前连接状态. 具体见： Meteor.status.
reconnect - 具体见：Meteor.reconnect.
disconnect - 具体见： Meteor.disconnect.
onReconnect -  Set this to a function to be called as the first step of reconnecting. This function can call methods which will be executed before any other outstanding methods. For example, this can be used to re-establish the appropriate authentication context on the new connection.
```
（ps：http://stackoverflow.com/questions/18358526/connect-two-meteor-applications-using-ddp#）
先看代码。由于这个东西是需要链接其它meteor应用，因此需要写两个meteor应用。被链接的应用 给个名字"main-server",主动去连接的"deputy-server"
##### main-server
先看main-server的文件结构：
```
-
--server 文件夹
    |--main.js
```
##### 代码
main.js:
```
People = new Meteor.Collection("people");//声明一个数据集合
//由于我们没有移除autopublish（见博客subliscribe），所以会自动推送到客户端
Meteor.startup(function(){
	//每次应用启动清空数据
	People.remove({});
	//这里的People使用的就是collections.js中定义的数据集操作对象
	var peoples = [
		{name:"小A",address:"长沙",phone:"111"},
		{name:"小B",address:"常德",phone:"222"},
		{name:"小C",address:"衡阳",phone:"333"},
		{name:"小D",address:"衡南",phone:"444"},
		{name:"小E",address:"株洲",phone:"555"}
	];
	for (var i = 0; i < peoples.length; i++)
		People.insert(peoples[i]);
});
```
代码很简单，就是初始化一些数据。

### deputy-server
这个里面先不需要任何代码。一下为shell
```shell
meteor create deputy-server
cd deputy-server
meteor remove autopublish
rm *.*
```

好了，这样基本ok。
先在3010端口启动main-server 应用：
```shell
cd main-server
meteor run -p 3010
```
然后在3000端口启动deputy-server
```shell
cd  deputy-server
meteor
```
为了更加直观的看到效果我们直接在浏览器控制台进行代码编写。

打开localhost:3000的控制台，输入
```
var remote = DDP.connect("http://localhost:3010");
```
这样就拿到了远程连接。

#### status
接着输入
```
remote.status()
```
就可以看到输出结果了。它的使用和Meteor.status()一致，不过它检查连接状态不是自己服务器的状态而是远程的服务器状态。类似的方法还有call，apply,reconnect,disconnect 为了节约篇幅就不在赘述，如果有疑问可以在博客下方留言。当然相关代码我还是会给出来的，可以去最后的下载链接去下载源码。

现在主要着重剩下几个有点不一样的函数。分别是 subscribe，methods，onReconnect。

#### subscribe
这个是订阅远程服务器的数据集。如何使用，继续接着上面的代码来，把下面这段代码复制到控制台：
```
var People = new Meteor.Collection('people',remote)
console.log(EJSON.stringify(People.find().fetch()))
```
可以看到3010应用的数据都在这里打印出来了。可以看到我们没有直接使用remote.subscribe，而是让Metoer.Collection内部调用这个函数。这里是封装起来了。因为如果直接使用我们没有办法拿到这个订阅数据集合的引用。这个大家有兴趣可以自己尝试一下。具体的Collection的说明我会在下一篇博客中具体说明。


#### onReconnect

这个函数的调用是优先于其他方法的掉用的，也就是说它是连接上远程服务器后执行的第一步。控制台输入
```
remote.onReconnect = function(){
    console.log(123)
}
```

然后重启main-server应用，发现有打印输出。更多的实际应用需要自己探索。

#### methods

官方文档是这样解释的- Define client-only stubs for methods defined on the remote server。英文翻译不好：“为 远程服务器上metheds定义的客户端存根”，关于Meteor.methods的具体使用我在以前的博客有写过，可以参考一下。
翻译不行，这里用代码解释一下。

先看main-server  index.js:(增加了最后几行代码定义了一个meteors函数集)
```
People = new Meteor.Collection("people");//声明一个数据集合
//由于我们没有移除autopublish（见博客subliscribe），所以会自动推送到客户端
Meteor.startup(function(){
	//每次应用启动清空数据
	People.remove({});
	//这里的People使用的就是collections.js中定义的数据集操作对象
	var peoples = [
		{name:"小A",address:"长沙",phone:"111"},
		{name:"小B",address:"常德",phone:"222"},
		{name:"小C",address:"衡阳",phone:"333"},
		{name:"小D",address:"衡南",phone:"444"},
		{name:"小E",address:"株洲",phone:"555"}
	];
	for (var i = 0; i < peoples.length; i++)
		People.insert(peoples[i]);
});

Meteor.methods({
	"sayHi":function(name){
		console.log("Hi"+name);
		return "I'm server"
	}
});
```

重启main-server。(注意是3010端口)

然后打开deputy-server的localhost:3000
粘贴以下代码到浏览器控制台：
```
var remote =  DDP.connect("http://localhost:3010");//链接远程服务器
remote.methods({
  "sayHi":function(){ console.log("I'm deputy-server client")}
}) //这就是定义远程调用的存根。

remote.call("sayHi","deputy",function(error,result){console.log(result)}) #调用远程方法
```

可以看到输出是：
```
I'm deputy-server client
undefined
I'm server
```
就是说在调用远程方法的时候，本地存根也会执行。

其他方法请参考下载连接里面的代码。

### 最后说一句
这个订阅远程服务器的函数，需要注意，如果你不想其他人来订阅你的应用的数据，一定要在Meteor.publish里面做好相关数据限制。