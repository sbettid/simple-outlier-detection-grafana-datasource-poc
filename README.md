# Simple Outlier Detection Grafana Datasource POC

## Why this repo?

This repo is connected with a series of blog posts on the 
[NetEye Blog](https://www.neteye-blog.com/). Its goal is to show how it is possible to
build a simple Grafana datasource to perform some basic outlier detection, using 
the Isolation Forests technique. 

## What you will find in the repo

In this repo you will find:

- the code of a simple Python web service to expose some data containing outliers, 
available in the `server` folder
- the code of the Grafana datasource plugin, available in the `src` folder
- an example dashboard to visualize the data after the outliers have been identified

## How to use the code

To use the code, we suggest you to:

1) Install the Python dependencies, needed for the web service, in a Python virtual
environment. 
2) Start the web service by executing `flask run` in the `server` folder
3) Build and install the Grafana datasource plugin, in an environment where Grafana is installed,
using the `build_and_apply.sh` Bash script.
4) Ensure the Grafana datasource plugin (unsigned) can be loaded by [Grafana](https://grafana.com/docs/grafana/latest/administration/plugin-management/#allow-unsigned-plugins)
5) Restart Grafana
