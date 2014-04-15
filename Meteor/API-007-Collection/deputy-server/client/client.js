function find(){
	console.log("RemotePeople findOne:")
	console.log(RemotePeople.findOne())
	console.log("IDPeople findOne:")
	console.log(IDPeople.findOne())
	console.log("People findOne:")
	console.log(People.findOne())
	console.log("LocalPeople findOne:")
	console.log(LocalPeople.findOne())
}

Meteor.setTimeout(find,5000);