class AddDurationToRoutes < ActiveRecord::Migration
  def change
    add_column :routes, :duration, :bigint
  end
end
