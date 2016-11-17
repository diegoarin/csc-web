require File.expand_path('../boot', __FILE__)
require 'rails/all'
require 'net/http'

Bundler.require(*Rails.groups)

module Seqari
  class Application < Rails::Application
    config.filter_parameters += [:password]
    config.active_record.raise_in_transactional_callbacks = true
    config.time_zone = 'Montevideo'
    ######################### GENERAL #########################

    #Google Maps
    config.google_directions_url = "https://maps.googleapis.com/maps/api/directions/json?"
    config.carrau_lat = "-34.873584"
    config.carrau_long = "-56.151004"
    config.carrau_location = "-34.873584,-56.151004"
    config.google_api_key = "AIzaSyD0iwHXLZMJpoPtipF5JNuNMwd-L5ZkaV8"
  end
end
