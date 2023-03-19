#! /usr/bin/python3

import numpy as np
from flask import Flask, request, jsonify
import time
import math
from flask_cors import CORS, cross_origin

quarter_hour_in_millis = 15*60*1000

app = Flask(__name__)
CORS(app)

#logging.getLogger('flask_cors').level = logging.DEBUG

def generate(median=10, err=4, outlier_err=15, size=10, outlier_size=10):
   errs = err * np.random.rand(size) * np.random.choice((-1, 1), size)
   data = median + errs

   lower_errs = outlier_err * np.random.rand(outlier_size)
   lower_outliers = median - err - lower_errs

   upper_errs = outlier_err * np.random.rand(outlier_size)
   upper_outliers = median + err + upper_errs

   data = np.concatenate((data, lower_outliers, upper_outliers))
   np.random.shuffle(data)

   return data


@app.route("/")
@cross_origin()
def main():
   return "Your datasource is working"

@app.route("/query")
def query():
   # compute defaults for query
   now_in_millis =  time.time() * 1000
   six_hours_ago = now_in_millis - 6*60*60*1000

   # get query params
   from_millis = int(request.args.get('from', six_hours_ago))
   to_millis = int(request.args.get('to', now_in_millis))

   # how many points? one every 15 minutes (nearly)...
   data_points_time = [from_millis]

   while from_millis < to_millis:
      from_millis += quarter_hour_in_millis
      data_points_time.append(from_millis)

   data_points_time.append(to_millis)

   outlier_size = math.ceil(0.05 * len(data_points_time))

   data_points = generate(size = len(data_points_time) - 2 * outlier_size, outlier_size = outlier_size)

   data = np.column_stack((data_points_time, data_points))

   response = jsonify({"query_response": data.tolist()})
   response.headers.add('Access-Control-Allow-Origin', '*')

   return response
