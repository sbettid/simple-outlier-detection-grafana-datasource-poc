#! /usr/bin/python3

import numpy as np
from flask import Flask, request, jsonify
import time
import math
from flask_cors import CORS, cross_origin

quarter_hour_in_millis = 15*60*1000

app = Flask(__name__)
CORS(app)

"""
   Function used to generate data with lower and upper outliers
   Parameters:
      - median: the median value of the resulting data set
      - err: error bound (both positive and negative) that we would like to apply to normal data points
      - outlier_err: error bound for outlier data points
      - size: default size of our data set
      - outlier size: default number of outliers
"""
def generate(median=10, err=4, outlier_err=15, size=10, outlier_size=4):
   # Generate an array of negative and positive errors
   errs = err * np.random.rand(size) * np.random.choice((-1, 1), size)

   # Sum to the errors the median. These will be our regular data points
   data = median + errs

   # Generate some lower outliers using the same approach.
   # First, generate some lower errors between 0 and 1 and multiply them with our outlier_err
   lower_errs = outlier_err * np.random.rand(outlier_size)

   # Then subtract the lower errors and the standard one from the median
   lower_outliers = median - err - lower_errs

   # Generate some upper outliers using the same approach.
   # First, generate some upper errors between 0 and 1 and multiply them with our outlier_err
   upper_errs = outlier_err * np.random.rand(outlier_size)

   # Then add the upper errors and the standard one to the median
   upper_outliers = median + err + upper_errs

   # concatenate and shuffle all the data we have generated
   data = np.concatenate((data, lower_outliers, upper_outliers))
   np.random.shuffle(data)

   return data


@app.route("/", methods=['GET'])
def main():
   return "Your datasource is working"

@app.route("/query", methods=['GET'])
def query():
   # Compute default time range for query (last six hours)
   now_in_millis =  time.time() * 1000
   six_hours_ago = now_in_millis - 6*60*60*1000

   # Get query params
   from_millis = int(request.args.get('from', six_hours_ago))
   to_millis = int(request.args.get('to', now_in_millis))

   # How many points? one every 15 minutes (roughly)...
   data_points_time = [from_millis]

   # So find all the timestamp for which we will generate the data
   while from_millis < to_millis:
      from_millis += quarter_hour_in_millis
      data_points_time.append(from_millis)

   data_points_time.append(to_millis)

   # Let's generate about 5% of outliers in our data points
   outlier_size = math.ceil(0.05 * len(data_points_time))

   # Generate data!
   data_points = generate(size = len(data_points_time) - 2 * outlier_size, outlier_size = outlier_size)

   # Join the generated data points with the related timestamps
   data = np.column_stack((data_points_time, data_points))

   # Everything to JSON and send back
   response = jsonify({"query_response": data.tolist()})

   return response
