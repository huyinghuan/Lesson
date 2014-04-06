### 写在前面的话 
 1. 该篇博客主要讲文件的下载和上传
 2. 基于0.8.0版本
 3. 基于iron-router包
 4. 本篇博客在ubuntu系统下操作。
 5. 本博客讲到是应用，需要掌握一些基础前提，如meteor文件夹机制等，这里不会详说。不明白到地方可以看下我写Meteor API博客系列。
 6. 博客地址：http://blog.csdn.net/a6383277/article/details/23023269 转载请注明出处
 

---
由于Meteor是单页应用没有自带路由功能，所以通常情况下，需要一个第三包 来实现路由功能。文件打上传和下载也是需要利用到router.因此在这里使用 [iron router][1] 包.  在利用iron到基础上，文件到下载和上传都是非常简单到。因此 本篇博客还会简写一下 我解决问题的过程。
[1]:https://github.com/EventedMind/iron-router
 
 
#### iron-router
 在创建 创建app以及安装iron-router前 ，我们需要用到第三方包管理器meteorite（貌似不支持windows），
 这里不多介绍，具体到应用和说明 如果有兴趣可以去 https://github.com/oortcloud/meteorite 了解一下
```shell
 sudo npm install -g meteorite 
```
 安装完成后，添加iron router
```shell
meteor create test
cd test
mrt add iron-router #使用meteorite

在添加iron-router时可能需要段时间，或者会卡住，请耐心。估计是网络不好到原因
```
先看文件上传代码：
/client/test.html
```html
<head>
  <title>testUpload</title>
</head>

<body>
  {{> hello}}
</body>

<template name="hello">
  <form action="/files" method="post" enctype="multipart/form-data">
	<p>要上传的文件２<input type="file" name="file2"/></p>
	<p><input type="submit" value="上传" /></p>
</form>
</template>
```

/server/index.js
```js
Router.map(function () {
  this.route('serverFile', {
    where: 'server',
    path: '/files',

    action: function () {
     //下面这句是重点
	  console.log(this.request.files);
      this.response.writeHead(200, {'Content-Type': 'text/html'});
      this.response.end('hello from server');
    }
  });
});
```
启动meteor
```shell
meteor
```
访问 localhost:3000

可以看到一个文件上传到表单，进行文件上传操作。 可以看到后台打印了类似下面的信息

```log
I20140406-12:19:34.064(8)? { file2: 
I20140406-12:19:34.214(8)?    { originalFilename: 'install.sh',
I20140406-12:19:34.214(8)?      path: '/tmp/4066-1jiytiv.sh',
I20140406-12:19:34.214(8)?      headers: 
I20140406-12:19:34.215(8)?       { 'content-disposition': 'form-data; name="file2"; filename="install.sh"',
I20140406-12:19:34.215(8)?         'content-type': 'application/x-shellscript' },
I20140406-12:19:34.215(8)?      ws: 
I20140406-12:19:34.215(8)?       { _writableState: [Object],
I20140406-12:19:34.215(8)?         writable: true,
I20140406-12:19:34.215(8)?         domain: null,
I20140406-12:19:34.215(8)?         _events: [Object],
I20140406-12:19:34.216(8)?         _maxListeners: 10,
I20140406-12:19:34.216(8)?         path: '/tmp/4066-1jiytiv.sh',
I20140406-12:19:34.216(8)?         fd: null,
I20140406-12:19:34.216(8)?         flags: 'w',
I20140406-12:19:34.216(8)?         mode: 438,
I20140406-12:19:34.217(8)?         start: undefined,
I20140406-12:19:34.217(8)?         pos: undefined,
I20140406-12:19:34.217(8)?         bytesWritten: 6711,
I20140406-12:19:34.217(8)?         closed: true,
I20140406-12:19:34.217(8)?         open: [Function],
I20140406-12:19:34.217(8)?         _write: [Function],
I20140406-12:19:34.217(8)?         destroy: [Function],
I20140406-12:19:34.218(8)?         close: [Function],
I20140406-12:19:34.218(8)?         destroySoon: [Function],
I20140406-12:19:34.218(8)?         pipe: [Function],
I20140406-12:19:34.218(8)?         write: [Function],
I20140406-12:19:34.218(8)?         end: [Function],
I20140406-12:19:34.218(8)?         setMaxListeners: [Function],
I20140406-12:19:34.218(8)?         emit: [Function],
I20140406-12:19:34.219(8)?         addListener: [Function],
I20140406-12:19:34.219(8)?         on: [Function],
I20140406-12:19:34.219(8)?         once: [Function],
I20140406-12:19:34.220(8)?         removeListener: [Function],
I20140406-12:19:34.220(8)?         removeAllListeners: [Function],
I20140406-12:19:34.220(8)?         listeners: [Function] },
I20140406-12:19:34.220(8)?      size: 6711,
I20140406-12:19:34.220(8)?      name: 'install.sh' } }
```
有点经验到程序员通过这些信息应该知道怎么处理这个上传的文件了。这里不详说了。

接下来看文件下载部分。这个部分也简单。这里只是一个demo。具体如何应用就是nodejs  api 的response部分了。
在/server/test.js增加以下代码，变成：
```js
Router.map(function () {
  this.route('serverFile', {
    where: 'server',
    path: '/upload',

    action: function () {
     //下面这句是重点
	  console.log(this.request.files);
      this.response.writeHead(200, {'Content-Type': 'text/html'});
      this.response.end('hello from server');
    }
  });
});
//文件下载部分
Router.map(function () {
  this.route('serverFile', {
    where: 'server',
    path: '/download',
    action: function () {
      this.response.writeHead(200, {
          'Content-type': 'text/html',
          'Content-Disposition': "attachment; filename=test.txt"
      });
      this.response.end('hello from server');
    }
  });
});
```
运行程序，在浏览器打开localhost:3000/download 即可下载文件了。

总的来说是非常简单的。可能最后问题解决的办法非常简单，但是在解决问题的过程没有这么简单了。下面说一下，解决问题的思路。
如果你只是需要解决问题，那么到此就可以到此为止了。下面的部分就可以跳过。

---

首先，我在考虑文件上传过程中第一个想到的是需要一个url来接受这个文件上传请求。
因此涉及到了 router的功能，在0.8.0之前有个router的包，可以在升级以后暂时不能用了，所以又搜索了一下，找到了iron router这个包。于是查找它的api看看有没有服务端的路由功能。在这里https://github.com/EventedMind/iron-router/blob/master/DOCS.md#server-side-routing 我看到了有关服务端的路由功能。
```
Server action functions (RouteControllers) have different properties and methods available. Namely, there is no rendering on the server yet. So the render method is not available. Also, you cannot waitOn subscriptions or call the wait method on the server. Server routes get the bare request, response, and next properties of the Connect request
```
因此后台是可以用request和response.那么应该就可以通过事件监听来处理数据了。但是具体的应用的，api文档里面没有继续写了，那这个request或者response 对象是否经过封装还是原生的reponse和request呢？
于是我就把iron router 的源码clone来了。文件不多。
第一步分析这个包的 package.js 因为写过meteor第三方包就知道，这个文件包含了代码的组织结构，包括把文件加载到客户端还是服务端。
iron router的package.js的内容如下（截取部分）：
```js

Package.on_use(function (api) {
  api.use('reactive-dict', ['client', 'server']);
  api.use('deps', ['client', 'server']);
  api.use('underscore', ['client', 'server']);
  api.use('ejson', ['client', 'server']);
  api.use('jquery', 'client');

  // default ui manager
  // use unordered: true becuase of circular dependency

  // for helpers
  api.use('ui', 'client', {weak: true});
 
  // default ui manager
  // unordered: true because blaze-layout package weakly
  // depends on iron-router so it can register itself with
  // the router. But we still want to pull in the blaze-layout
  // package automatically when users add iron-router.
  api.use('blaze-layout', 'client', {unordered: true});

  api.add_files('lib/utils.js', ['client', 'server']);
  api.add_files('lib/route.js', ['client', 'server']);
  api.add_files('lib/route_controller.js', ['client', 'server']);
  api.add_files('lib/router.js', ['client', 'server']);

  api.add_files('lib/client/location.js', 'client');
  api.add_files('lib/client/router.js', 'client');
  api.add_files('lib/client/wait_list.js', 'client');
  api.add_files('lib/client/hooks.js', 'client');
  api.add_files('lib/client/route_controller.js', 'client');
  api.add_files('lib/client/ui/helpers.js', 'client');

  api.add_files('lib/server/route_controller.js', 'server');
  api.add_files('lib/server/router.js', 'server');

  api.use('webapp', 'server');
```
很清晰的看到 
```
api.add_files('lib/server/route_controller.js', 'server');
api.add_files('lib/server/router.js', 'server');
```
这两个文件是加载在服务端的，其他文件是同时加载在客户端和服务端的。先不去分析，看看这两个文件。
通过查看lib/server/route_controller.js ，里面代码比较少 发现没有request相关代码，于是打开lib/server/router.js
发现了以下代码：
```js
if (typeof __meteor_bootstrap__.app !== 'undefined') {
  connectHandlers = __meteor_bootstrap__.app;
} else {
  connectHandlers = WebApp.connectHandlers;
}
...
...
  constructor: function (options) {
    var self = this;
    IronRouter.__super__.constructor.apply(this, arguments);
    Meteor.startup(function () {
      setTimeout(function () {
        if (self.options.autoStart !== false)
          self.start();
      });
    });
  },

  start: function () {
    connectHandlers
      .use(connect.query())
      .use(connect.bodyParser())
      .use(_.bind(this.onRequest, this));
  },
...
```
发现是```connectHandlers```来接管了http的请求并使用了connect，继续在代码里找，于是在代码的最上面发现：
```
var connect = Npm.require('connect');
```
原来最后使用了connect来处理请求。
那么接着我们去找connect包。看看里面的request和response到底封装了什么功能。
在github找到```connect``` https://github.com/senchalabs/connect
发现这个项目是express这个团队在维护。当然这是闲话，还是先找文档再说。
在connect文档中发现，connect是一个中间件的集合。所有的请求都会经过这些中间件的处理。 那么我先找bodyparse()看看里面有没有对文件的处理， 于是发现了body-parser这个链接 进去看看于是到了
https://github.com/expressjs/body-parser，发现文档很简单，不是很详细，到底它做了些什么呢？看下源码试试，涉及到的文件很少，只有个index.js ，那就看这个文件吧（如果文件很多，回去分析package.json这个文件，看看入口文件是哪个，如果没有main配置，那默认情况下是index.js）。发现下面这段代码：
```
    getBody(req, {
      limit: options.limit || '100kb',
      length: req.headers['content-length'],
      encoding: 'utf8'
    }, function (err, buf) {
      if (err) return next(err);

      var first = buf.trim()[0];

      if (0 == buf.length) {
        return next(error(400, 'invalid json, empty body'));
      }

      if (strict && '{' != first && '[' != first) return next(error(400, 'invalid json'));
      try {
        req.body = JSON.parse(buf, options.reviver);
      } catch (err){
        err.body = buf;
        err.status = 400;
        return next(err);
      }
      next();
```
没有找到关于文件流的读写。不过到现在能确定的是request是原生态的request,不过给它添加了一下属性。好吧，看样子body-parser并没有添加对文件的分析，而是在最后 执行了next()，看样子是交给了其他中间件处理。本来到这里，我没有继续下去了，准备用request的原始方法事件监听来处理文件上传的数据。但是我回到connect主页时，偶然发现了这段：
```
Some middleware previously included with Connect are no longer supported by the Connect/Express team, are replaced by an alternative module, or should be superceded by a better module. Use one of these alternatives intead:
```
这下面有些非官方维护的中间件其中就有个
```
connect-multiparty
```
发现 和文件上传表单的```enctype="multipart/form-data"```类似，抱着试试一试的心态 进去看看https://github.com/andrewrk/connect-multiparty，哈哈在readme里发现个有趣的东东
```
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
app.post('/upload', multipartMiddleware, function(req, resp) {
  console.log(req.body, req.files);
  // don't forget to delete all req.files when done
});
```
竟然有个 ```req.files```难道这个中间件处理文件上传？那就在test测试里面试试？
结果打印```this.request.files```真发现了上传文件有关信息了。接着尝试读取一下，正确无误！文件上传就这么 简单的搞定了。根本不用自己去监听request data事件了。
至此搞定。
```
其实接下来我还是去看来下这个connect-multiparty的源码，发现这个中间件其实也没有直接处理文件流而是调用封装了另外一个库 multiparty 地址：https://github.com/andrewrk/node-multiparty/，在这里才是真正处理了文件流的读取操作。
在整个问题的处理过程中，主要是对中间件（middleware）概念有个基础的了解(ps:个人理解为 类似于java里面的filter进行http请求的逐层处理)，然后知道在connect处理http进行过很多处理，在这些中间件中找到了对文件的处理结果。
```