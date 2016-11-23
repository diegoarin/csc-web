class User < ActiveRecord::Base
  acts_as_authentic  do |c|
    c.validate_password_field = true
    c.require_password_confirmation = true
    c.logged_in_timeout = 30.minutes
    c.crypto_provider = Authlogic::CryptoProviders::Sha512
  end
  validates_presence_of   :login, :email
  validates_uniqueness_of :login, :email
  scope :by_email, lambda {
   order(email: :asc)
  }

  def deliver_password_reset_instructions!
    reset_perishable_token!
    Notifier.password_reset_instructions(self).deliver_now
  end
end
