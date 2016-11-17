class AddNearToRouteClients < ActiveRecord::Migration
  def change
    add_column :route_clients, :near, :boolean, default: false
  end
end
