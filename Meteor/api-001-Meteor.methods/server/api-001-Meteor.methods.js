var fs = Npm.require('fs');
var readFile = Meteor._wrapAsync(fs.readFile.bind(fs));
var writeFile = Meteor._wrapAsync(fs.writeFile.bind(fs));
Meteor.methods({
    "test":function(a){
      this.unblock();
      if(a==1){
          //这里我通过多次读写文件的时间耗费进行阻塞
          //，注意文件大小最好是在10M-40M之间，太小的文件，或者一般的计算可能执行速度太快看不到效果
          var data = readFile("/home/ec/download/NVIDIA");
         for(var i=0;i<5;i++){
            writeFile("/home/ec/download/test/NVIDIA"+i, data);
            console.log(a+"-"+i);
        }
      }
      console.log(a);   
      return a;
    }
});