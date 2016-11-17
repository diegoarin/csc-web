class Order < ActiveRecord::Base
  attr_accessor :business_name
  belongs_to :client
  validates  :status, inclusion: { in: %w(PENDING IN_TRANSIT DELIVERED DELIVERED_WITHOUT_VALIDATION NOT_DELIVERED) }
  scope :by_created, lambda {
    order(created: :asc)
  }
end
