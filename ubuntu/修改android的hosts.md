ubuntu修改 android host
--------------
至于为什么要修改hosts，相信你懂的。。。

###
在Android下，/etc是link到/system/etc的，我们需要修改/system/etc/hosts来实现。但是这个文件是只读，不能通过shell直接修改。可以通过连接到PC上使用adb来修改。
1.  将hosts文件复制到PC：adb pull /system/etc/hosts hosts

2.  获取root权限

```
adb shell
su
```

3. 设置hosts为可读写
```
cd /system/etc/
chmod 777 hosts
```


4. 修改PC机上文件

5. 将PC机上文件复制到手机：adb push hosts /system/etc/hosts

至此，对hosts的修改就成功了。无需重启哦～！～

如果要查看是否修改成功，可以在PC上执行adb shell，运行cat /system/etc/hosts；或者在手机的终端模拟器上运行cat /system/etc/hosts。
