class ChangeColumnName < ActiveRecord::Migration
  def change
    rename_column :orders, :delivered, :finalized
  end
end
