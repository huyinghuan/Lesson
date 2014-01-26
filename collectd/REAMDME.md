

#####安装collectd报错。尝试 yum install perl-CPAN

#### The configuration can usually be found in /opt/collectd/etc/collectd.conf.
 
#### For each plugin, there is a LoadPlugin line in the configuration. 
 
#### Almost all of those lines are commented out in order to keep the default configuration lean. 
 
#### the number of comment characters used is significant(特殊意义):
```
1.  Lines commented out with two hash characters ("##") belong to plugins that have not been built. Commenting these lines in will result in an error, because the plugin does not exist.
2.  The LoadPlugin lines commented out using one hash character ("#") belong to plugins that have been built. You can comment them in / out as you wish.
3.  By default the following plugins are enabled: CPU, Interface, Load, and Memory.
```

### 开始
#### 配置日志输出文件
 collectd 默认用的是syslog日志插件。但是这些日志会输出到系统日志里面。一般而言，我们希望这些日子在我们指定的地方保存。因此使用logfile Plugin，相关配置可以在Collectd的两个wiki找到：[logfile plug][1]和 [collctd.conf-logfile][2],而不是使用syslog Plugin。
因此需要在配置文件中见syslog的配置注释掉，然后开启logfile Plugin

#### 安装libcurl
如果是debian ubuntu安装 试试
sudo apt-get install libcurl3 python-pycurl
如果是Redhat系 CentOS RHEL Fedora试试
yum -y install curl curl-devel
 
[1]:(https://collectd.org/wiki/index.php/Plugin:LogFile)
[2]:(https://collectd.org/wiki/index.php/Plugin:LogFile)