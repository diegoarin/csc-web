class RemoveDurationFromRoutes < ActiveRecord::Migration
  def change
    remove_column :routes, :duration, :datetime
  end
end
