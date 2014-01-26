
###写在前面的话
1. 本篇博客主要介绍Mongobd的用户管理
2. 本篇博客以参考官方文档为主
3. 本篇涉及到官方文档的部分是：[ http://docs.mongodb.org/manual/core/access-control/ ]
4. 如果可能，请尽量阅读官方文档，而不是看我的这篇博客。个人强烈推荐直接阅读官方文档。
5. 本人英语水平不好，肯定会遇到错误或疏忽之处，请指出。（这也是推荐直接官方Docs的原因之一）
6. 转载请注明出处，

#### 开始
先看下官方文档的简单介绍
>MongoDB provides support for authentication and authorization on a per-database level. Users exist in the context of a single logical database.

MongoDb提供的基于数据库级别的权限控制，每个数据库都有属于自己的管理者帐号。这一点不同与Mysql之类的数据库，Mysql中的用户是对创建的connection里面的每个数据库都具有操作权限。而Mongodb是每个数据库都拥有一个套属于自己的用户表。例如，有两个db A和B，在A中的用户UserA，在B中是不存在的，更不用说操作权限了。

在用户安装完monogdb后 默认是没有开启权限验证 。如果希望开启，则需要自己配置。当然，这也是属于本篇博客的主要内容了。
在敲代码之前先讲官方文档提到的东西。

1. 每个db中有存在一个叫system.users（如果没管理者信息，则不存在）的Collection，这个Collection中就保存着当前这个db的管理用户帐号信息。描述原文如下：
>For basic authentication, MongoDB stores the user credentials in a database’s system.users collection.

在Mongodb中有个叫admin的数据库。这个admin数据库提供一个在其他数据库中不可使用的角色。这个角色可以在其他数据库中创建超级管理员。
```
简单来说就是 有个叫admin的数据库，这里面保存着一种角色，这个角色无法直接操作其他的数据。但是，这个角色可以为其他数据库来添加一个超级管理员。 换句话说，除admin之外的其他db（假设为D），需要admin数据库里面的角色（假设为A）权限来创建一个属于自己的管理员（假设为B），这个管理员B才具有对D具有增删改（当然增删改的权限可以分别对B进行现在，在A创建B时）的权限，A 确实没有这个权限的。
```
这个大概就是mongodb的用户管理的一个大致分析。

下面我们根据实际操作来看看 用户增加使用。
### 添加超级管理员

第一步 ，先得安装好mongodb和设置好它。具体可以见我的另外一篇[博客][1]。

启动mongod

运行以下命令：（#号后面为注释）
```
use admin #切换到admin db
db.addUser( { user: "admin", #替换成自己的用户名
              pwd: "password", #替换成自己的密码 
              roles: [ "userAdminAnyDatabase" ] } )
```
运行完上面的命令后，大概会出来这个东西
```
{
	"user" : "admin",
	"pwd" : "90f500568434c37b61c8c1ce05fdf3ae",
	"roles" : [
		"userAdminAnyDatabase"
	],
	"_id" : ObjectId("52d400465feca82c4fdb1a48")
}
```
现在超级数据库管理员 [注：这里包括下文 把admin数据库中创建的用户，叫做超级管理员] 已经完成创建了。
现在验证一下
```
db.auth("admin","password");#实际上这个相当于一个登录操作。
```
这是如果帐号密码输入正确的话，应该返回一个 1.否则返回 0。

这时你可以执行：
```
show collections
```
发现多了两个collections（原来是没有任何东西）
看看里面有什么
```
db.system.users.find();
db.system.index.find();
```
结果就不写出来了。毕竟是一下就知道了。

最开始提到过，每个数据库的管理者者必须存在当前这个数据库中。这个貌似就验证了一部分。（因为用户admin是数据库admin的system.users中的一条）

接下来我们创建一个数据库，给里面添加一些数据。为后面的内容做下准备。记住，最开始就提到过了， mongodb默认是没有开启验证的，开启用户验证需要自己去配置，而我们现在也还没有进行配置，因此现在是可以操纵其他数据库的。

```
use hello #切换到一个新的数据库
db.hello.insert({"name":"xiaoming",age:18}) #添加一条记录。（ps：小明又上场了！）
show collections #可以看到并没有出现system.users.
```
好了现在准备工作已经做完了：
1.在没有开启用户验证之前，我们配好了一个超级用户管理，它有权限给其他数据库添加管理员角色。2.创建了个测试用的数据库hello ，并且给一个叫hello的Collections添加了一天记录（我们并没有给它添加管理员。）

### 配置用户验证
现在我们开启验证模式。
修改/etc/mongodb.conf (这里是linux下的mongodb配置文件，如果在window下也找到这个文件就是了，当然前提是你自己创建了它)
在这个配置文件里面添加上一个key-value: auth=true,内容如下：
```
dbpath=/home/ec/workspace/mongodb
logpath=/home/ec/workspace/mongodb/db.log
logappend=true
auth=true
```
保存退出。

哦，这里提一个事情。先看一段[官方文档][2]：
> Authenticate with Full Administrative Access via Localhost
If there are no users for the admin database, you can connect with full administrative access via the localhost interface. This bypass exists to support bootstrapping new deployments. This approach is useful, for example, if you want to run mongod or mongos with authentication before creating your first user.
To authenticate via localhost, connect to the mongod or mongos from a client running on the same system. Your connection will have full administrative access.
To disable the localhost bypass, set the enableLocalhostAuthBypass parameter using setParameter during startup

这里说了一件事，比较重要。在默认情况下通过localhost链接到的mongodb，（这里有个前提是：在admin没有用户的情况下）这个连接拥有完整的权限。
也就是说，如果你是在自己的pc上链接自己pc上安装的mongodb，那么不需要做任何验证就拥有了所有的权限。（这个也说明为什么我们可以添加超级管理员了）
```
    其实这里我是有个疑问的，（英文不好没办法，谁能清楚的解释请留言）就是上面说的通过loaclhost链接具有所有权限。第二段的开始（"If there are no users for the admin database"），在第三段（To authenticate via localhost, ）是否还继承了这个前提？等下我们通过测试，来验证这个情况后。
```
那么可以修改这个默认吗？当然是可以的。文档也说了，只要在启动mongod时加上参数即可,如：
```
#先了解下这个，在重启时，我们先不添加这个参数。完成测试和在来添加这个参数看看有什么不同.
mongod --setParameter enableLocalhostAuthBypass=0  
```

好了上面已经修改完成了配置文件。现在重启mongod。（linux，或window可以找到运行的mongod这个进程来进行关闭[如果你的mongod已经在后台运行了的话],在启动mongod）

##配置数据库管理员

重启mongod以后，运行客户端mongo 。我们先看看，能不能给hello添加一个管理员身份。
```
use hello
db.addUser("helloAdmin","654321") #addUser就是 添加管理员动作了。
```
这时报错了
```
Mon Jan 13 23:33:22.621 error: { "$err" : "not authorized for query on hello.system.users", "code" : 16550 } at src/mongo/shell/query.js:128
```
看来没有登录超级管理员看样子是无法为hello添加管理员了。
```
这里提一下，怎么来添加数据库的管理员。有个理解，等下我们在来一步步测试。
1. 选择admin数据库，用我们初始化超级管理员时创建的那个用户进行登录
2. 选择对应的数据库，如hello。然后调用管理员添加函数添加管理员A。
3. 以hello数据库管理员A的身份登录数据库hello。然后就可以操作hello数据库。
具体命令请接着往下面看。
```
既然我们添加不了 管理员身份。 那就这么前提提出的那个以localhost链接的用户具有超级管理员身份的假设不符。
但是这里只是没有管理元添加权限，还有个数据添加权限没有测试。下面测试一下数据的添加，查找权限。
```
db.hello.find()
```
同样报错了。
```
error: { "$err" : "not authorized for query on hello.hello", "code" : 16550 }
```
看来数据的查询权限也没有。看样子是我的理解错了。一旦admin里面出现了管理员，并开启了权限验证。那么localhost的链接具有的超级权限就没有。（这里还有个地方没测试到，有兴趣的同学可以测试一下。就是当admin中没有用户时，开启权限验证auth=true，这时本地链接是否具有超级权限？）

好了，既然上面的假设不存在了。那么我们就按部就班的来添加一个数据库的管理员，并使用他添加查询数据了。

```
use admin #在下一步执行前，你也许可以测试一下是不是能添加超级管理员？
db.auth("admin","password")
use hello
db.addUser("helloAdmin","123456") #添加管理员
db.auth("helloAdmin","123456") #以刚才添加的帐号登录
db.hello.find() #测试是否具有查询权限
db.hello.insert({name:"testInsert",age:0}) #测试是否具有添加数据的权限
#测试证明数据的增删改权限都已经具有了（删除，和修改可以自己去测试，不浪费空间了）
```

```
这里有一点需要大家先注意一下的，那就是我们添加helloAdmin时是在hello这个数据库目录（暂且怎么叫吧，我一时没想到词语）下添加的。（也就是在addUser操作是在use hello后面， 两条命令直接没有其他use 命令了。后面将解释为什么我要提这一点出来。）
```

整篇博客到这里应该就差不多了。

### 管理员权限设置
其实还有丢掉了2个地方没讲,一个是给数据库添加管理员的时候限制数据库管理员的权限。二个是添加超级管理员（admin数据库中添加用户）时，限制该超级管理员的权限。
先讲一下，第一个点。
有兴趣可以看下官方稳定的原文在[这里][3]

在我们使用db.addUser(username,password)这样方式添加用户时，该用户拥有对该数据库的全部权。如果需要对它的权限进行限制（ＣＵＲＤ），那么需要使用下面这中方法：
```
db.addUser( { user: "Alice",
              pwd: "Moon1234",
              roles: [ "readWrite", "dbAdmin" ]
            } )
```
```
另外提一句，在2.4以前的版本里，可以通过addUser这个函数给一存在的用户 修改密码了。
原来修改密码的方式是：
db.addUser("reporting","123456")
后面重写了addUser[这样设计也与我们所有的单一原则有矛盾]，就无法通过它来修改密码了。
如过在2.4以后的版本依然这么用，那么就会抛出一个错误出来。
经过修改后 用户的密码修改成为一下这种方式：
db = db.getSiblingDB('records')  #注意这里的records 是你要修改的用户所在的数据库名称
db.changeUserPassword("reporting", "123456")
上面就是给records数据库中已存在的管理员reporting来修改密码为123456了。
当然你要给一个人修改密码，你当前的身份当然也必须有这个修改权限了。这个角色是：
userAdmin

```
user 和 pwd分别表示 账户名和密码,roles则表示它的权限了。roles的值是一个数组。
它的可选值有：read，readWrite，dbAdmin,userAdmin
具体每个值具有什么权限可以参考[官方文档][4],这里简单的说明一下，毕竟涉及的东西太过与细小。
```

read：从单词的字面意思就知道了。就是对该数据库具有读的权限，也就是可以使用find函数。简单的列举一些：
    aggregate
    checkShardingIndex
    cloneCollectionAsCapped
    collStats
    count
    dataSize
    dbHash
    dbStats
    distinct
    filemd5
    geoNear
    geoSearch
    geoWalk
    group
    mapReduce (inline output only.)
    text (beta feature.)
    
readWriet:很简单，具有读写权限。出了read具有的权限外 ，还拥有 insert(), remove(), and update().等。同样列举一些小的出来:
    cloneCollection (as the target database.)
    convertToCapped
    create (and to create collections implicitly.)
    drop()
    dropIndexes
    emptycapped
    ensureIndex()
    findAndModify
    mapReduce (output to a collection.)
    renameCollection (within the same database.)

dbAdmin :（使用db.addUser(usenname,password)得到的角色拥有这个这种权限了） 根据单词很容易猜得出，这就是拥有这个数据库的所有操作权限了。包括以上两种，另外还有：
    clean
    collMod
    collStats
    compact
    convertToCapped
    create
    db.createCollection()
    dbStats
    drop()
    dropIndexes
    ensureIndex()
    indexStats
    profile
    reIndex
    renameCollection (within a single database.)
    validate

userAdmin：（使用db.addUser(usenname,password)得到的角色拥有这个这种权限了）
  顾名思义，这个角色权限用户对system.users的读写操作权限了。
  
 
 以上四个角色（可以说是权限） 存在于一般的数据库中。
 
 接下来的这几种权限 仅在admin数据库中有效。

```
### 超级管理员权限设置
 超级管理员权限包括：clusterAdmin,readAnyDatabase,readWriteAnyDatabase,userAdminAnyDatabase,dbAdminAnyDatabase
 他们的含义应该不用多说就可以明白了。（我们添加的第一个用户权限就是userAdminAnyDatabase这种角色类型了）
 这些角色（权限），大家可以自己尝试，看看有什么不同的效果。
 
 好了。所有的内容正式完成了。现在来看一下几个Demo。熟悉一下。
 
```
use products
db.addUser( { user: "Alice",
              pwd: "123456",
              roles: [ "readWrite", "dbAdmin" ]
            } )
```
给数据库products添加一个Alice角色，该角色具有完全的数据库数据读写权限（前提你没有登录超级管理员的角色。但是不能添加管理，可以自己尝试一下）
```
注意！强调！注意！ 当然你使用过如下命令时：
use admin
db.auth("admin","123456")
也就是你在admin数据库下登录过时，你在当前角色的添加用户的权限在其他数据库中都是存在。因为admin本来就是管理其他数据库的。

就算以后你在其他数据库登录过了，如接着使用：
use hello
db.auth("Alice","123456")
那么此时在本次会话中（这里把从启动mongo 客户端连接开始叫做会话），你用户以前所有登录过的角色权限及保村在当前的session中（官方没有提到这个session这个词语，但是在这里我觉得挺能表达我意思），直到本次会话结束（mongo客户端关闭），才取消。也就是在切换到不同数据库时，你在这次会话中对于每个数据库都用户添加用户的权限（因为你已经登录过admin数据库了了）
举个例子来说：
你先登录过了admin数据库（当然实际情况是不需要登录这个的。）然后 你在数据库A，B，C中都登录过，他们的管理员分别是a，b，c，那么在切换会A，B，C时，不需要在进行登录操作了（已经保持了登录信息）。而且你在切换到不同数据库时，都拥护添加用户的权限（因为你登录了admin），否则则更加当前数据库的登录者（如A的管理者账户a的权限userAdmin来判断，是否能添加数据了）
所以你如果要测试userAdmin这个权限，你需要重启下mongo链接，因为在前面的尝试中我们登录过了admin，所以哪怕你当前的数据库A的管理员a没有userAdmin权限也可以添加用户。重启会注销登录信息，运行use A，然后登录a来测试 userAdmin

语言的组织能力不是很好，这段写的不是那么清楚。不明白的地方自己做两次测试就会清楚了。当然是在不清楚，可以在博客下方留言。我尽量解答
```
下面接着举几个demo 根据官方来的。大家就想下是什么作用，然后用实际命令来检验一下自己的想法是否正确。我就不再解释了。权当思考吧。
1.
```
use admin
db.addUser( { user: "Bob",
              userSource: "products",
              roles: [ "userAdmin" ]
            } )
```
官方解释：
>he following creates a user named Bob in the admin database. The privilege document uses Bob’s credentials from the products database and assigns him userAdmin privileges.

2.
```
db = db.getSiblingDB('admin')
db.addUser( { user: "Carlos",
              pwd: "Moon1234",
              roles: [ "clusterAdmin" ],
              otherDBRoles: { config: [ "readWrite" ]
            } } )
```
官方解释：
>he following creates a user named Carlos in the admin database and gives him readWrite access to the config database, which lets him change certain settings for sharded clusters, such as to disable the balancer

[1]:(http://blog.csdn.net/a6383277/article/details/8559360)
[2]:(http://docs.mongodb.org/manual/tutorial/add-user-administrator/)
[3]:(http://docs.mongodb.org/manual/tutorial/add-user-administrator/)
[4]:(http://docs.mongodb.org/manual/reference/user-privileges/)
