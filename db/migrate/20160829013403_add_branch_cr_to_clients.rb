class AddBranchCrToClients < ActiveRecord::Migration
  def change
    add_column :clients, :branch_cr, :integer, index: true
  end
end
