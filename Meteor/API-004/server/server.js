var conn =  Meteor.onConnection(function(connection){
	/*
	lbacks will be called again, and the new connection will have a new connection id.
	官方文档提到了。当一个客户端重新链接到服务器时，它会重新分配一个uuid.这里包括了断线重连，页面刷新等。
	在后面的版本中将改变这个策略，客户端重新连接的话会保持这个id标志符不变。当前这个回调函数也不会在执行。只有当是一个全新的连接时，才会执行它。
	*/
	var uuid = connection.id; //连接的uuid 每个连接都有一个自己的uuid 类似java里面的sid.
	console.log("当前这个连接的uuid 是:" +uuid);
	//connection.close()  //关闭这个连接 通过调用它也会关闭这个链接
	//通过定时器来模拟某种需要关闭的情况。如：ip来源不合法等。当然客户端的还是会进行尝试连接到此。
	//可以看到10秒后，页面将会改变
	var closeTest = function(){
		connection.close();
	}
	//这个Meteor.setTimeout 类似于原生js的setTimeout，不过原生的setTimeout可能会出现预料之外的结果,因此推荐Meteor封装后的。
	Meteor.setTimeout(closeTest,10000);

	//当连接断开后会执行里面的回调函数,如果连接已经处理关闭状态，那么这个回调函数会立即执行。
	//包括在客户端断网，刷新页面等情况或者调用Meteor.disconnect()等方法都会触发这个回调函数函数。
	connection.onClose(function(){
		console.log("连接已关闭")
	});
	
	//客户端ip地址，可以利用这个东西来拒绝一些访问请求。根据实际情况灵活应用吧。
	/**  注意：下面这段话翻译自文档。我没有亲自实验过。请各位自行验证。如有翻译不正确的地方，可以在我博客下方留言，我会改正。
	如果你的meteor工程在另外一个代理后（例如挂在了nginx后面），为了正确的获取到客户端的ip地址 你需要设置环境变量HTTP_FORWARDED_COUNT 
	设置 HTTP_FORWARDED_COUNT为一个整数来表示前面经过了几层代理 .例如代理只有一层时，你应该设置它的值为1.
	*/
	var clientAddress = connection.clientAddress;
	console.log("客户端ip是："+clientAddress);

	//这个是http头信息，不包括Cookie
	var httpHeaders = connection.httpHeaders;
	console.log("http头是："+EJSON.stringify(httpHeaders));
});

//当调用conn.stop()后，  上面onConnection里面的回调函数都不会执行了。
//下面通过一个定时器来模拟某种需要关闭的情况
function abc(){
	conn.stop();
}
//10秒后停止监听。在期间我们不断刷新页面来看打印效果，10秒再刷新页面就不会出现打印了。
//可以取消下面的这行注释看效果
//Meteor.setTimeout(abc,10000);