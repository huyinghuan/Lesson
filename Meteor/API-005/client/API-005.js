Session.setDefault("name","test");//设置默认值
var  demoFunctionWillNotCall = function (){
	var s = Session.get("name")
	console.log("name Session 改变,发生调用");//这句话永远不会打印,哪怕name发生改变。因为它没有被任何Template对象调用
}
var demoFunctionWillCall = function(){
	var s = Session.get("age");
	console.log("age Session 改变,发生调用");//一旦age的值改变 这句话就会打印,因为它在testFunction中被调用了
	return "call"
}

Template.testValue.testSessionChangeForValue = function () {
  return Session.get("name");
};

Template.testFunction.testSessionChangeForFunction = function () {
  demoFunctionWillCall()
  return "test Age";
};
