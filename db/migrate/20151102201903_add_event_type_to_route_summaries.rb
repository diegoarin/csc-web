class AddEventTypeToRouteSummaries < ActiveRecord::Migration
  def change
    add_column :route_summaries, :event_type, :string
  end
end
