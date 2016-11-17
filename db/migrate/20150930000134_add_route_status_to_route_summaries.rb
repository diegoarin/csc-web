class AddRouteStatusToRouteSummaries < ActiveRecord::Migration
  def change
    add_column :route_summaries, :route_status, :string
  end
end
