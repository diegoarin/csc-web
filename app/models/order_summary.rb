class OrderSummary < ActiveRecord::Base
	attr_accessor :business_name
	validates_presence_of :event
	scope :by_event, lambda {
  	order(event: :asc)
	}
end
