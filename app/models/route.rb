class Route < ActiveRecord::Base
  attr_accessor :dispatcher_name
  validates_presence_of :start
  has_many :route_clients
  validates  :status, inclusion: { in: %w(PENDING IN_TRANSIT FINISHED) }
  scope :by_start, lambda {
    order(start: :asc)
  }
end
