class RouteClient < ActiveRecord::Base
    attr_accessor :client_name
    has_many    :orders
    belongs_to  :route
    validates_presence_of   :date
    validates  :status, inclusion: { in: %w(PENDING IN_TRANSIT DELIVERED DELIVERED_WITHOUT_VALIDATION NOT_DELIVERED) }
    scope :by_date, lambda {
        order(date: :asc)
    }
end
