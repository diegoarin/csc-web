class RemoveEventTypeFromRouteSummaries < ActiveRecord::Migration
  def change
    remove_column :route_summaries, :event_type, :integer
  end
end
