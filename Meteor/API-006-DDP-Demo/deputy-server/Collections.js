var remote =  DDP.connect("http://localhost:3010");//链接远程服务器
People  =  new Meteor.Collection('people',remote)