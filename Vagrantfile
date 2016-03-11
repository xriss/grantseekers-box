# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "precise64"
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"
  config.vm.network :private_network, ip: "10.42.23.66"
  config.vm.synced_folder "./box", "/box"
  config.vm.provision :shell, :path => "provision.sh", privileged: false

config.vm.provider "virtualbox" do |v|
  v.memory = 512
end

end


