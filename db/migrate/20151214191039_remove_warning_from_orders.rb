class RemoveWarningFromOrders < ActiveRecord::Migration
  def change
    remove_column :orders, :warning, :datetime
  end
end
