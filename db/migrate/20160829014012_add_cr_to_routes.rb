class AddCrToRoutes < ActiveRecord::Migration
  def change
    add_column :routes, :cr, :integer, index: true
  end
end
