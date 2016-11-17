#!/bin/bash
# -*- ENCODING: UTF-8 -*-

rake db:drop
rake db:create
rake db:migrate
rake db:seed
rake current_orders
rake all_routes_new
