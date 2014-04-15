var remote =  DDP.connect("http://localhost:3010");//链接远程服务器
remote.onReconnect = function(){
	console.log("每次链接上远程服务器会打印这句话")

};

remote.methods({
	"sayHi":function(){
		console.log("执行本地的存根sayHi")
	}
})

console.log("5秒后执行 远程服务器调用 sayHi \n  然后在隔5秒断开远程服务其 \n接着隔5秒重新连接远程服务器 \n 5秒后再一次执行远程 sayHi \n \n");

function disconnectRemoteServer(){
	console.log("断开连接")
	remote.disconnect();
	Meteor.setTimeout(reconnectRemoteServer,10000);
}

function reconnectRemoteServer(){
	console.log("重新连接")
	remote.reconnect();
	Meteor.setTimeout(applyRemoteMeteods,10000);
}

function applyRemoteMeteods(){
	remote.apply("sayHi",["deputy-server apply"],function(error,result){
		console.log(result)
	})
}

function callRemoteMethods(){
	remote.call("sayHi","deputy-server call",function(error,result){
		console.log(result)
	})
	Meteor.setTimeout(disconnectRemoteServer,10000);
}

Meteor.setTimeout(callRemoteMethods,10000);