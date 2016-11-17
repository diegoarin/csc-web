class CreateOrders < ActiveRecord::Migration
    def change
        create_table :orders do |t|
            t.integer     :cr, index: true
            t.datetime    :created
            t.datetime    :delivered
            t.datetime    :warning
            t.datetime    :alert
            t.string      :status, default: 'PENDING'
            t.belongs_to  :client, index: true
            t.references  :route_client, index: true

            t.timestamps null: false
        end
    end
end
