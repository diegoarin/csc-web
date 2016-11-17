class Client < ActiveRecord::Base
    has_many                :orders
    validates_presence_of   :business, :address, :lat, :long, :cr, :branch_cr
    validates :cr, uniqueness: {scope: :branch_cr}
    scope :by_business, lambda {
        order(business: :asc)
    }
end
