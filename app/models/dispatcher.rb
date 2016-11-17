class Dispatcher < ActiveRecord::Base
  validates_presence_of   :name, :phone, :device, :cr
  validates_uniqueness_of :phone, :device, :cr
  scope :by_name, lambda {
    order(name: :asc)
  }
end
