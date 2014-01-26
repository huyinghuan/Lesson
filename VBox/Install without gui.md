
## 写在前面的话
1. 本篇博客主要讲述如果在Ubuntu Server下安装Vbox，已经创建或者导入已有虚拟机。
2.  本篇博客非原创。主要来自3个网站，分别是 [VBox论坛][1],[VBox Docs][2]和一个[不知名网址][3]
3.  如有可能请尽量阅读[官方文档][4]
4.  本篇博客虽然是说在没有GUI的情况下进行安装VBox，但是在实际动手前 我们总需要测试一下是吧，要是直接在Server上装，中间出错了，那还不把我骂死去？所以测试的话我们就选我们平时工作时的带UI界面的Ubuntu，只不过我们全程使用命令行来完成导入，创建而已。
5.  转载请注明出处 http://blog.csdn.net/a6383277/article/details/18315155

### 准备
1.安装VBox安装文件，首先的得下载个Vbox放在服务器上面吧？
2.下载VBox扩展。进到下载网址[下载的网址][5]，找到和安装文件对应的版本号文件夹，下载里面的一个如这样名字的 Oracle_VM_VirtualBox_Extension_Pack-4.3.6-91406.vbox-extpack 文件，注意和你使用的VBox版本需要一致。

### 开始安装
以Ubuntu为例（#后面为注释）
```
sudo apt-get install dkms build-essential  #安装编译工具
sudo dpkg -i virtualbox-4.3.6-91406~Ubuntu~maverick_i386.deb #安装软件
```
在这一步，可能会报错。（如果没有报错，则下面的可以跳过）类似依赖包缺少的错误。如果你自己能够独立安装这些依赖关系可以自己解决。否则可以尝试下面的方法，自动安装。
```
sudo apt-get -f install
```
这一步安装完成时，会继续重复上一次安装vbox的过程的过程。如果没有安装vbox可以在运行一次
```
sudo dpkg -i virtualbox-4.3.6-91406~Ubuntu~maverick_i386.deb
```
等待安装完成后进行下一步

### 安装扩展
安装扩展的命令很简单：（注意.vbox-extpack的位置不要弄错了）
```
VBoxManage extpack install Oracle_VM_VirtualBox_Extension_Pack-4.3.6-91406.vbox-extpack
```

这时我们可以测试一下
```
VBoxManage list extpacks
```

如果出现一下类似信息就是安装成功了。
```
Extension Packs: 1
Pack no. 0:   Oracle VM VirtualBox Extension Pack
Version:      4.2.12
Revision:     84980
Edition:      
Description:  USB 2.0 Host Controller, VirtualBox RDP, PXE ROM with E1000 support.
VRDE Module:  VBoxVRDP
Usable:       true 
Why unusable: 
```

### 导入已有的虚拟机（.ova文件）
本来按理应该说是先讲创建的。个人原因吧。先把导入说完。
假设现在一存在一个导出的ova文件  ub-server.ova
那么导入命令是：
```
VBoxManage import ub-server.ova
```
这个命令可以加上参数 --dry-run或者-n（-n为OVF文件时选择）表示在导入完成后立即尝试启动[我尝试的时候失败了]，如：
```
VBoxManage import ub-server.ova --dry-run
```

导入完成后，我们可以看下导入的虚拟机的信息
```
VBoxManage showvminfo "ub-server"

当然如果不记得名字了的话可以用
VBoxManage list vms 来查看已存在的虚拟机列表
```

接下来我们可以尝试启动一下了。
```
VBoxManage startvm ub-server
```
启动完成。命令行结束了。
结果傻眼了。。为什么？因为我们是在测试，是在有UI的ubuntu上来玩它的，那么它启动了。我们可以直观的看到，然后登录它。当时如果是在服务器上，我们一般是ssh链接操作的， 我们根本就看不到界面！根本无法登录到这个虚拟机里面去查看他的ip了。因为没有ip我们就不知道怎么ssh它。

好吧，接着往下看。
我们先把刚才启动的虚拟机关闭掉。
然后运行下面这个
```
VBoxHeadless --startvm "ub-server" &
```
这个是什么作用呢？这个实际是就是VBox为这个虚拟机开了个远程桌面。
这个的端口默认是：3389
当然如果你不喜欢它那么你可以用下面命令修改它的默认
```
VBoxHeadless --startvm "ub-server" -e "TCP/Ports=8899" &
```
上面这个就是修改到了8899端口了

这个时候你可以用远程桌面来查看它了。

ubuntu自带了一个远程桌面是Remmina工具。可以用它来连接。当然如果你没有装的话可以安装这个工具
```
 sudo apt-get install rdesktop
```
centos之类的操作系统可以用这下面的安装命令了。
```
 sudo yum install rdesktop
```
这个软件使用也非常简单：
```
rdesktop -a 16 <IP_address_host_machine:port_number>
```

因为我这里是在本地测试所以命令是这样的
```
rdesktop -a 16 127.0.0.1:3389 #这里使用默认端口
```
然后你就可以看到启动界面了。至于怎么配置网卡信息之类的就不是本篇博客的内容了。但是LZ我还是挺有爱的。还是讲一下吧。。。  ^ _ ^

首先 ，如果你是从本机导出，然后有导入到本机的话，应该是不会出现问题的。（我没有尝试）
如果你是从A导出，然后在B或C 导入，那么因为pc的配置不同，会导致导入的虚拟机无法连接网络。抑或无法发现网卡。现在我大概讲一下几种解决办法。
1.如果你是从一个pc A拷贝到另一个pc B，而且他们都是用的有线网卡。那么解决办法相对来说比较简单。

```
解决办法A：（下文也会提到这个，请注意。）
（Ubuntu的话）找到 /etc/udev/rules.d/70-persistent-net.rules 注释掉里面的所有内容。重启虚拟机就可以了。
sudu reboot
在这里centos的文件存在的地方有点点不同。应该也在/etc/udev目录下，但是具体的位置得搜索了。 文件名也不同但是基本都是xx-persistent-net.rules这个文件 
```

如果依然无法配置网卡，那么你应该重新设置下虚拟机的网卡类型。
首先把开启的虚拟机关掉。查看本虚拟机的相关配置信息。
```
VBoxManage showvminfo ub-server --machinereadable #这里ub-server是我的虚拟机的名字，你需要改成自己的，下文不再标明。
```
这里会有一大堆信息出来。这里截取一部分有用的
```
...
bridgeadapter1="eth0"
macaddress1="080027C8DD05"
cableconnected1="on"
nic1="bridged"
nictype1="82540EM"
nicspeed1="0"
nic2="none"
...
```
这一部分就是关于网卡的配置信息了。
看到```nictype1```,它的值是82540EM。这个值代表一种网卡类型。在VBox中，网卡类型有这么几种：
```
AMD PCNet PCI II (Am79C970A);
AMD PCNet FAST III (Am79C973, the default);
Intel PRO/1000 MT Desktop (82540EM);
Intel PRO/1000 T Server (82543GC);
Intel PRO/1000 MT Server (82545EM);
Paravirtualized network adapter (virtio-net).
```
这里我的对应的是```Intel PRO/1000 MT Desktop```这个网卡类型。
这些网卡具体有什么不同，请看[官方文档][6]。这里只说一个，那么就是当你导入的虚拟机不是```Am79C973```这种网卡类型，并且根据上文提到的解决办法A还是无法连上网时，请尝试修改成这个网卡类型。因为这个网卡类型匹配绝大多数网卡。
```
VBoxManage modifyvm  ub-server --nictype1  Am79C973
```
完成之后可以再重复尝试上面提到的解决办法A。

如果你是有线网卡的pc 导出的虚拟机 导入到无线网卡的pc中，反之亦然。那么可能你就需要添加一块当前使用虚拟网卡了。就是说当你的虚拟机在不同网络模式中（包括无线和有线）使用时可能需要切换网卡（如果网卡不存在，那么也还需要添加）

你可以通过一下命令来查看当前的可用网卡：
```
VBoxManage list bridgedifs
```
显示如下信息：
```
Name:            wlan0
GUID:            6e616c77-0030-4000-8000-6036dd82d336
DHCP:            Disabled
IPAddress:       192.168.1.103
NetworkMask:     255.255.255.0
IPV6Address:     fe80:0000:0000:0000:6236:ddff:fe82:d336
IPV6NetworkMaskPrefixLength: 64
HardwareAddress: xx:36:xx:82:d3:xx
MediumType:      Ethernet
Status:          Up
VBoxNetworkName: HostInterfaceNetworking-wlan0

Name:            eth0
GUID:            30687465-0000-4000-8000-b888e3e8bab3
DHCP:            Disabled
IPAddress:       0.0.0.0
NetworkMask:     0.0.0.0
IPV6Address:     
IPV6NetworkMaskPrefixLength: 0
HardwareAddress: b8:xx:e3:xx:ba:xx
MediumType:      Ethernet
Status:          Up
VBoxNetworkName: HostInterfaceNetworking-eth0
```
看到IPAddress不为0.0.0.0的那个，也就是```wlan0``` 也就是当前可用的网卡是```wlan0```了，
在上文中，我们通过```VBoxManage showvminfo ub-server --machinereadable```查看并挑选出了```ub-server```的网卡信息部分。发现它的```bridgeadapter1="eth0"```，也就是说在导出之前，这个虚拟机使用的是```eth0```的网卡类型。而当前我们机器上可用的是```wlan0```,（当然如果在你当前实验的机器上可用的就是```eth0``` 那就就不需要下面的修改配置步骤了。）那么如果你不修改她的网卡配置，那么就会导致无法连接网络了。这是我们不能容忍的。
```
说明：一般来说使用的有线网卡是eth0,无线网卡是wlan0.那么就是说在一般的台式机上就是eth0,笔记本上那么就有eth0,和wlan0两种了。至于选择哪一种，那就是根据上文提到的方法，看看哪个是当前网络的使用模式是wifi连的还是网线连接了。根据实际情况选择。貌似说得有点罗嗦了。
```

现在来修改网卡配置（这里把虚拟机```ub-server```修改成```wlan0```连接）：
```
VBoxManage modifyvm ub-server --bridgeadapter1 wlan0
```
好了现在启动虚拟机，上文提到过的
```
VBoxHeadless --startvm "ub-server" &
```
新开个终端监听vbox的远程桌面。（完全模拟服务器操作）
```
rdesktop -a 16 127.0.0.1:3389 #这里使用默认端口 而且如果是服务器的话127.0.0.1应该改成服务器的ip。如果服务器还有防火墙应该关闭。
```
登录虚拟机后，找到网卡配置文件（上文提到过，这里以ubuntu为例，当然如果启动后先检查一下网卡是否正常，正常的话就不用进行下面的操作了。使用ifconfig查看当前网络配置）
```
cd /etc/udev/rules.d/
sudo vim 70-persistent-net.rules
```
进入后编辑（如果不知道使用vim ，那我没半点办法），注释掉或者删除所有内容，保存退出。
```
好吧，就当你不会用vim吧。
sudo vim 70-persistent-net.rules运行这个命令后，不要按任何按钮。
只按字母键 d ，不断的按直到里面的内容全部删除完全后。同时按住Shift键和 : 键,也就是输出一个：后，紧接着后面敲 wq，  在窗口的底部会出现类似这样的
:wq
然后回车就可以了。
```
重启虚拟机。
```
sudo reboot
```
登录虚拟机后出现
```
Welcome to Ubuntu 12.04.3 LTS (GNU/Linux 3.8.0-29-generic i686)

 * Documentation:  https://help.ubuntu.com/

  System information as of Thu Jan 16 21:01:13 CST 2014

  System load:  0.21              Processes:           73
  Usage of /:   13.2% of 7.26GB   Users logged in:     1
  Memory usage: 6%                IP address for eth0: 192.168.1.109
  Swap usage:   0%

  Graph this data and manage this system at https://landscape.canonical.com/

Last login: Thu Jan 16 21:00:18 2014
```
搞定，收工！
等等...次奥...还只搞定了 导入虚拟机部分。怎么创建还没说呢。。。 T T
写上面这一部就写了两天才研究琢磨透。

没办法，不浪费大家时间 ，我们接着来吧。

```
注意！！！！下面的这部分内容直到 创建虚拟机内容开始  与本篇博客需要讲述的毫无关系。仅为个人命令备份记忆。请不要自己在虚拟机里面使用，导致无法链接网络，本人不负责。当然既然我不负责的话，你们想玩玩也可尝试着玩玩嘛。。。哈哈。。
```
```
添加网卡
VBoxManage natnetwork add -t wlan-test -n "192.168.15.0/24" -e

nat-int-network 是  192.168.9.0/24的一个名字，可以任意。192.168.9.0/24根据实际情况来

在添加网网卡后给该网卡添加DHCP server
VBoxManage natnetwork modify -t wlan-test -h on

将网络连接修改成桥接
vboxmanage modifyvm winxp --nic1 bridged --bridgeadapter1 wlan-test
```


### 创建虚拟机
创建貌似比导入简单一些。。。
在自己的机器上开一个终端。（也就是模拟ssh到服务器上），运行创建命令：
```
VBoxManage createvm --name "lzGoodboy" --register
```
上面这个命令注册创建了一个叫```lzGoodBoy```的虚拟机。 注意这里还没有配置内存，显卡怎么之类的。我们通过
 ```VBoxManage modifyvm```这个命令来添加修改。

添加完成后我们查看下是否添加成功了

```
 VBoxManage list vms
```
得到下面的信息
```
"xp" {f379678e-bee9-4d07-ad47-da4c05b69525}
"centos" {e73df52a-f9ef-4f05-8a3f-04013845ade4}
"ub-server" {24182f56-6e7c-497c-aa96-70422996afa3}
"lzGoodboy" {2af26cc3-ad30-44d5-bb99-107455c977f7}
```
这里看到了```lzGoodboy```这个虚拟机了。
现在开始配置硬盘CPU什么的
```
VBoxManage modifyvm "lzGoodboy" --memory 512 --acpi on --boot1 dvd --nic1 bridged --bridgeadapter1 wlan0 --ostype Linux
```
其实根据单词意思就应该知道配置的是一些什么内容。稍微解一下：
memory 内存显而易见
acpi 这个是主板控制器？还是什么？LZ见识浅不知道。好吧百度一下。意思是：高级配置与电源接口。英文单词是：
>Advanced Configuration and Power Management Interface


boot1 这个应该是设置引导的启动顺序，--boot1 dvd应该就是以dvd优先引导。毕竟我们需要安装镜像嘛。。。

nic1 熟悉的nic又来了。。没错这就是网卡相关的配置了。前文提到很多次了。```--nic1 bridged``` 使用桥接模式 （这里我们只讨论桥接模式。因为是在服务器上按照虚拟机，所以肯定是需要有内网ip的，并且能够以来主机连接网络）

bridgeadapter1 eth0 桥接网卡的适配器。这里怎么选择不用多讲了吧。上文应该是讲的的很清楚了。根据实际情况来。

ostype Linux 操作系统类型ID ```Linux``` 还可以具体是其他的。这里不一一列举。你可以通过命令```VBoxManage list ostypes```来查看所支持的操作系统以及对应的ID了。 所以```--ostype```后面跟的参数是 上面命令所展示出来信息里面的ID字段。如果你的ID不正确 ，那么就会报错了。如Ubuntu的虚拟机你就可以是```--ostype Ubuntu```，因为我在写这篇博客的时，电脑里没有ubuntu系统只有个centos 就只能讲究一下了。又因为在支持的操作系统里面没有直接指明是centos的ID就只能用ID Linux来代表普遍性的linux系统了，如centos

接着我们创建个虚拟硬盘

```
VBoxManage createvdi --filename ~/VirtualBox\ VMs/lzGoodboy/lzGoodboy.vdi --size 9000
```
上面这个命令的意思是在主文件夹～下的VBox默认配置文件夹下 VirtualBox VMs（在命令中有一个\是因为中间有个空格，需要转义一下）下创建一个属于虚拟机lzGoodboy的一个虚拟硬盘（当然这个虚拟硬盘位置可以随意，不一定要像我这样放在VirtualBox VMs之类目录下，自己记住在哪就好，等下需要挂到虚拟机上）。size参数后面接着的就是硬盘大小了，单位是MB。

添加一个IDE控制器
```
VBoxManage storagectl "lzGoodboy" --name "IDE Controller" --add ide
```
然后挂上我们创建的硬盘
```
VBoxManage storageattach "lzGoodboy" --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium ~/VirtualBox\ VMs/lzGoodboy/lzGoodboy.vdi
```
硬盘挂上了，接着挂上一个DVD光驱。并加载好ISO镜像。（ISO镜像的文件位置请根据实际情况来，我这里是放在了主目录下的download文件夹下了。）

```
VBoxManage storageattach "lzGoodboy" --storagectl "IDE Controller" --port 1 --device 0 --type dvddrive --medium /home/ec/download/CentOS-6.5-i386-LiveCD.iso
```
就这样基本硬件都已经配置好了。上面的内容中我没有讲到关于设置显卡内存，CPU核心数之类的设置。这些你可以到[官方文档][2]找到.如果没有主动去配置这些，Vbox也会生产一些默认的配置。如CPU的核心默认就是1个。显存默认是12M。
```
如设置cpu核心是
VBoxManage modifyvm "lzGoodboy" --cpus 2 #允许虚拟机使用两个核心
```
解下来就是启动虚拟机了。和在导入虚拟机那部分说的差不多。通过远程桌面来安装。毕竟系统安装过程中有些选项是必须直接填选的。

```
VBoxHeadless --startvm "lzGoodboy"
```
远程
```
rdesktop -a 16 127.0.0.1:3389
```
这时你就可以看到远程的Vbox界面了。下面的安装系统部分就不是这篇博客讨论的范围了。

对了最后补上一下 对于启动中的虚拟机的一些控制命令：(具体见[官方文档][7])
```
VBoxManage controlvm lzGoodboy pause #控制虚拟机lzGoodboy暂停
VBoxManage controlvm lzGoodboy resume #重启
VBoxManage controlvm lzGoodboy reset #重启
VBoxManage controlvm lzGoodboy poweroff #重启关机
VBoxManage controlvm lzGoodboy savestate #保存状态
...
```
正式完工。
转载请注明出处。--结束于2014-01-16 22：17

[1]:(https://forums.virtualbox.org/viewtopic.php?f=7&t=38323)
[2]:(http://www.virtualbox.org/manual/ch08.html)
[3]:(http://xmodulo.com/2013/05/how-to-create-and-start-virtualbox-vm-without-gui.html)
[4]:(http://www.virtualbox.org/manual/)
[5]:(http://download.virtualbox.org/virtualbox/)
[6]:(https://www.virtualbox.org/manual/ch06.html#nichardware)
[7]:(https://www.virtualbox.org/manual/ch08.html#vboxmanage-controlvm)