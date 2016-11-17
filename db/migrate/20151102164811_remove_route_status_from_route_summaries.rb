class RemoveRouteStatusFromRouteSummaries < ActiveRecord::Migration
  def change
    remove_column :route_summaries, :route_status, :string
  end
end
