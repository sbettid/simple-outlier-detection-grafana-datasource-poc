#! /bin/bash

# install yarn globally
npm install yarn --global

# install the dependencies

yarn install

# build frontend part
echo "Building the frontend"

yarn build

if ! yarn build ; then
  echo "[-] Error when building the frontend"
  exit 1
fi

# copy built files
echo "Applying changes"

systemctl stop grafana-server

mkdir -p /var/lib/grafana/plugins/simple-outlier-detection-grafana-datasource-poc

yes | cp -r dist/* /var/lib/grafana/plugins/simple-outlier-detection-grafana-datasource-poc

# permissions
chown -R grafana:grafana /var/lib/grafana/plugins/simple-outlier-detection-grafana-datasource-poc

# restart
systemctl start grafana-server

