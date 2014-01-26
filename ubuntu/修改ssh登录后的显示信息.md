
一般ssh登录服务器
```
ssh xxx.xxx.xxx.xxx
password:xxxx
```
后会出现如下信息：
```
Linux relativity 2.6.31-14-server #48-Ubuntu SMP Fri Oct 16 15:07:34 UTC 2009 x86_64

To access official Ubuntu documentation, please visit:
http://help.ubuntu.com/

  System information as of Tue Feb 16 09:23:08 PST 2010

  System load: 0.0                Memory usage: 17%   Processes:       132
  Usage of /:  7.4% of 219.83GB   Swap usage:   0%    Users logged in: 0

  Graph this data and manage this system at https://landscape.canonical.com/

Last login: Fri Feb 12 15:58:46 2010 from xxx.xxx.xxx.xxx
```
如果想要在这里加上一些描述，比如声明里面的一些注意注意事项等。可以去目录
```
/etc/update-motd.d/
```
查看里面的文件。这里面的信息就是登录后的相关提示信息的设置。
如我们需要在最后添加一些消息，如：
```
Welcome to  Server
```
可以修改文件
```
99-footer
```
这个文件。在后面最后面加上，适当的shell就可以了。如
```
echo Welcome to  Server
```
或者根据99-footer这里面内：
```
....
[ -f /etc/motd.tail ] && cat /etc/motd.tail || true
```
去修改 文件/etc/motd.tail既可。如果该文件不存在，可以自己创建一个。里面的文本内容都会显示出来。