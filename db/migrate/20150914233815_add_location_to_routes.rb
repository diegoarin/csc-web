class AddLocationToRoutes < ActiveRecord::Migration
  def change
    add_column :routes, :latitude, :float, default: Rails.configuration.carrau_lat
    add_column :routes, :longitude, :float, default: Rails.configuration.carrau_long
  end
end
