class RemoveAlertFromOrders < ActiveRecord::Migration
  def change
    remove_column :orders, :alert, :datetime
  end
end
