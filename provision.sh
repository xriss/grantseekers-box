sudo apt-get update
sudo apt-get install -y aptitude curl

echo " install mongo db"
sudo aptitude install -y mongodb

#cho " install a working mongodb as the default one is broken "
#sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
#echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb.list
#sudo aptitude update
#sudo aptitude upgrade -y

#echo " install and enable byobu "
sudo aptitude install -y byobu
byobu-enable

echo " install nvm and a working node "
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
export NVM_DIR="/home/vagrant/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
nvm install stable

echo " installing git and build essentials "
sudo aptitude install -y git build-essential

echo " setting up NodeBB "
cd /box
npm install

echo " now you can run vagrant ssh "
echo " cd /box "
echo " ./nodebb setup "
echo " ./nodebb serv "
echo " then visit http://10.42.23.66:4567/ to view "


