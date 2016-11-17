class AddBranchNameToClients < ActiveRecord::Migration
  def change
  	add_column :clients, :branch_name, :string
  end
end
