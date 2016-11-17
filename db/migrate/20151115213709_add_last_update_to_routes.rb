class AddLastUpdateToRoutes < ActiveRecord::Migration
  def change
    add_column :routes, :last_update, :datetime
  end
end
